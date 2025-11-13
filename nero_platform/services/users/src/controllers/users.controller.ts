/**
 * Users Controller
 * 
 * Контроллер для управления пользователями
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@neiro/database';
import { AppError } from '../utils/AppError';
import { publishEvent } from '../services/events.service';

const prisma = new PrismaClient();

export const usersController = {
  /**
   * GET /users/v1
   * Получение списка пользователей с пагинацией
   */
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '20', cursor, role, status } = req.query;
      const parsedLimit = Math.min(parseInt(limit as string, 10), 100);

      // Построение фильтров
      const where: any = {};
      if (role) where.role = role;
      if (status) where.status = status;

      // Cursor-based пагинация
      const users = await prisma.user.findMany({
        where,
        take: parsedLimit + 1,
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor as string },
        }),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          phone: true,
          createdAt: true,
        },
      });

      const hasMore = users.length > parsedLimit;
      const data = hasMore ? users.slice(0, -1) : users;
      const nextCursor = hasMore ? users[parsedLimit].id : undefined;

      res.status(200).json({
        data,
        meta: {
          total: data.length,
          hasMore,
          nextCursor,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /users/v1/:id
   * Получение пользователя по ID
   */
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Проверка прав: пользователь может просматривать только свой профиль
      // или если он admin/supervisor
      if (
        currentUser.userId !== id &&
        !['admin', 'supervisor'].includes(currentUser.role)
      ) {
        throw new AppError(
          'Недостаточно прав для просмотра профиля',
          403,
          'FORBIDDEN'
        );
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          specialist: true,
        },
      });

      if (!user) {
        throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        phone: user.phone,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        specialist: user.specialist
          ? {
              id: user.specialist.id,
              specialty: user.specialist.specialty,
              licenseNumber: user.specialist.licenseNumber,
              experienceYears: user.specialist.experienceYears,
              bio: user.specialist.bio,
            }
          : null,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /users/v1/:id
   * Обновление данных пользователя
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const updateData = req.body;

      // Проверка прав
      if (
        currentUser.userId !== id &&
        !['admin'].includes(currentUser.role)
      ) {
        throw new AppError(
          'Недостаточно прав для обновления профиля',
          403,
          'FORBIDDEN'
        );
      }

      // Пользователь не может изменить свою роль или статус (только admin)
      if (currentUser.userId === id && currentUser.role !== 'admin') {
        delete updateData.role;
        delete updateData.status;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          phone: true,
          timezone: true,
          updatedAt: true,
        },
      });

      // Публикация события
      await publishEvent('users.user.updated', {
        userId: user.id,
        updatedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /users/v1/:id
   * Деактивация пользователя (soft delete)
   */
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Нельзя деактивировать самого себя
      if (currentUser.userId === id) {
        throw new AppError(
          'Нельзя деактивировать собственный аккаунт',
          400,
          'SELF_DEACTIVATION'
        );
      }

      await prisma.user.update({
        where: { id },
        data: { status: 'suspended' },
      });

      // Публикация события
      await publishEvent('users.user.suspended', {
        userId: id,
        suspendedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /users/v1/:id/children
   * Получение детей пользователя (для родителей)
   */
  async getUserChildren(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Проверка прав
      if (
        currentUser.userId !== id &&
        !['admin', 'supervisor'].includes(currentUser.role)
      ) {
        throw new AppError(
          'Недостаточно прав для просмотра детей',
          403,
          'FORBIDDEN'
        );
      }

      const childrenParents = await prisma.childParent.findMany({
        where: { parentUserId: id },
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              birthDate: true,
              gender: true,
              diagnosisSummary: true,
              createdAt: true,
            },
          },
        },
      });

      const children = childrenParents.map((cp) => ({
        ...cp.child,
        relationship: cp.relationship,
        legalGuardian: cp.legalGuardian,
        linkedAt: cp.linkedAt,
      }));

      res.status(200).json({ data: children });
    } catch (error) {
      next(error);
    }
  },
};

