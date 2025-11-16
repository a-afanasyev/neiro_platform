/**
 * Specialists Controller
 * 
 * Контроллер для управления специалистами
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@neiro/database';
import { AppError } from '../utils/AppError';
import { publishEvent } from '../services/events.service';

const prisma = new PrismaClient();

export const specialistsController = {
  /**
   * GET /users/v1/specialists
   * Получение списка специалистов
   */
  async listSpecialists(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '20', cursor, specialty } = req.query;
      const parsedLimit = Math.min(parseInt(limit as string, 10), 100);

      const where: any = {};
      if (specialty) where.specialty = specialty;

      const specialists = await prisma.specialist.findMany({
        where,
        take: parsedLimit + 1,
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor as string },
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              status: true,
            },
          },
        },
      });

      const hasMore = specialists.length > parsedLimit;
      const data = hasMore ? specialists.slice(0, -1) : specialists;
      const nextCursor = hasMore ? specialists[parsedLimit].id : undefined;

      res.status(200).json({
        success: true,
        data: data.map((s) => ({
          id: s.id,
          userId: s.userId,
          specialty: s.specialty,
          licenseNumber: s.licenseNumber,
          licenseValidUntil: s.licenseValidUntil,
          experienceYears: s.experienceYears,
          bio: s.bio,
          user: s.user,
        })),
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
   * GET /users/v1/specialists/:id
   * Получение профиля специалиста
   */
  async getSpecialist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const specialist = await prisma.specialist.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              status: true,
              timezone: true,
            },
          },
        },
      });

      if (!specialist) {
        throw new AppError('Специалист не найден', 404, 'SPECIALIST_NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          id: specialist.id,
          userId: specialist.userId,
          specialty: specialist.specialty,
          licenseNumber: specialist.licenseNumber,
          licenseValidUntil: specialist.licenseValidUntil,
          experienceYears: specialist.experienceYears,
          bio: specialist.bio,
          user: specialist.user,
          createdAt: specialist.createdAt,
          updatedAt: specialist.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /users/v1/specialists/:id
   * Обновление профиля специалиста
   */
  async updateSpecialist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const updateData = req.body;

      // Проверка, что специалист существует и пользователь имеет право его редактировать
      const specialist = await prisma.specialist.findUnique({
        where: { id },
      });

      if (!specialist) {
        throw new AppError('Специалист не найден', 404, 'SPECIALIST_NOT_FOUND');
      }

      // Проверка прав: только сам специалист или admin
      if (
        currentUser.userId !== specialist.userId &&
        currentUser.role !== 'admin'
      ) {
        throw new AppError(
          'Недостаточно прав для обновления профиля',
          403,
          'FORBIDDEN'
        );
      }

      const updated = await prisma.specialist.update({
        where: { id },
        data: updateData,
      });

      // Публикация события
      await publishEvent('users.specialist.updated', {
        specialistId: updated.id,
        userId: specialist.userId,
        updatedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /users/v1/specialists/:id/children
   * Получение детей, с которыми работает специалист
   */
  async getSpecialistChildren(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Проверка, что специалист существует
      const specialist = await prisma.specialist.findUnique({
        where: { id },
      });

      if (!specialist) {
        throw new AppError('Специалист не найден', 404, 'SPECIALIST_NOT_FOUND');
      }

      // Проверка прав
      if (
        currentUser.userId !== specialist.userId &&
        !['admin', 'supervisor'].includes(currentUser.role)
      ) {
        throw new AppError(
          'Недостаточно прав для просмотра детей',
          403,
          'FORBIDDEN'
        );
      }

      const childrenSpecialists = await prisma.childSpecialist.findMany({
        where: { specialistId: id },
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

      const children = childrenSpecialists.map((cs) => ({
        ...cs.child,
        specialization: cs.specialization,
        isPrimary: cs.isPrimary,
        assignedAt: cs.assignedAt,
        roleDescription: cs.roleDescription,
      }));

      res.status(200).json({
        success: true,
        data: children,
      });
    } catch (error) {
      next(error);
    }
  },
};

