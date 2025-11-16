/**
 * Auth Controller
 * 
 * Контроллер для обработки запросов аутентификации
 */

import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@neiro/database';
import { JWT_CONFIG } from '@neiro/utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwt.service';
import { redisClient } from '../services/redis.service';
import { publishEvent } from '../services/events.service';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const authController = {
  /**
   * POST /auth/v1/login
   * Аутентификация по email/password
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Поиск пользователя
      const user = await prisma.user.findUnique({
        where: { email },
        include: { specialist: true },
      });

      if (!user) {
        throw new AppError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS');
      }

      // Проверка статуса
      if (user.status === 'suspended') {
        throw new AppError('Аккаунт заблокирован', 403, 'ACCOUNT_SUSPENDED');
      }

      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS');
      }

      // Генерация токенов
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Сохранение refresh token в Redis (TTL: 30 дней)
      await redisClient.setex(
        `refresh_token:${user.id}`,
        30 * 24 * 60 * 60, // 30 дней в секундах
        refreshToken
      );

      // Публикация события (для аналитики)
      await publishEvent('auth.user.logged_in', {
        userId: user.id,
        role: user.role,
        timestamp: new Date().toISOString(),
      });

      // Формат ответа согласно ApiResponse<T>
      res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60, // 15 минут в секундах
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/v1/refresh
   * Обновление access токена
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      // Валидация refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Проверка наличия токена в Redis
      const storedToken = await redisClient.get(`refresh_token:${payload.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new AppError('Недействительный refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Получение пользователя
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.status !== 'active') {
        throw new AppError('Пользователь не найден или неактивен', 401, 'USER_INACTIVE');
      }

      // Генерация нового access token
      const accessToken = generateAccessToken(user);

      // Формат ответа согласно ApiResponse<T>
      res.status(200).json({
        success: true,
        data: {
          accessToken,
          expiresIn: 15 * 60,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/v1/logout
   * Выход из системы
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;

      // Удаление refresh token из Redis
      await redisClient.del(`refresh_token:${userId}`);

      // Публикация события
      await publishEvent('auth.user.logged_out', {
        userId,
        timestamp: new Date().toISOString(),
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/v1/invite
   * Приглашение нового пользователя (admin only)
   */
  async invite(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role, firstName, lastName } = req.body;
      const invitedBy = (req as any).user.userId;

      // Проверка существования пользователя
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('Пользователь с таким email уже существует', 409, 'USER_EXISTS');
      }

      // Генерация временного пароля для приглашенного пользователя
      const temporaryPassword =
        Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      // Создание пользователя со статусом 'invited'
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          role,
          status: 'invited',
          password: hashedPassword,
        },
      });

      // TODO: Отправка email с приглашением (через сервис Communications)

      // Публикация события
      await publishEvent('auth.user.invited', {
        userId: user.id,
        email: user.email,
        role: user.role,
        invitedBy,
        timestamp: new Date().toISOString(),
      });

      // Формат ответа согласно ApiResponse<T>
      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          invitationSent: true,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /auth/v1/me
   * Получение информации о текущем пользователе
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          specialist: true,
        },
      });

      if (!user) {
        throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          phone: user.phone,
          timezone: user.timezone,
          specialist: user.specialist
            ? {
                id: user.specialist.id,
                specialty: user.specialist.specialty,
                experienceYears: user.specialist.experienceYears,
              }
            : null,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

