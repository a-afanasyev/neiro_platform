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
        success: true,
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
        },
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

      res.status(200).json({
        success: true,
        data: user,
      });
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

      res.status(200).json({
        success: true,
        data: children,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /users/v1/:id/gdpr/export
   * GDPR: Экспорт всех данных пользователя
   * Право на портируемость данных (Article 20 GDPR)
   */
  async exportUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Пользователь может экспортировать только свои данные
      if (currentUser.userId !== id) {
        throw new AppError('Вы можете экспортировать только свои данные', 403, 'FORBIDDEN');
      }

      // Собираем все данные пользователя из всех связанных таблиц
      const userData = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
          // Связанные данные
          specialist: {
            select: {
              specialty: true,
              licenseNumber: true,
              experienceYears: true,
              bio: true,
              createdAt: true,
            },
          },
          childrenParents: {
            select: {
              relationship: true,
              legalGuardian: true,
              linkedAt: true,
              child: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  birthDate: true,
                  gender: true,
                },
              },
            },
          },
          reports: {
            select: {
              id: true,
              submittedAt: true,
              status: true,
              childMood: true,
              feedbackText: true,
              durationMinutes: true,
              reviewedAt: true,
              reviewStatus: true,
              assignment: {
                select: {
                  id: true,
                  assignedAt: true,
                  dueDate: true,
                },
              },
            },
          },
          userNotifications: {
            select: {
              id: true,
              type: true,
              title: true,
              message: true,
              status: true,
              createdAt: true,
              readAt: true,
            },
          },
          notificationPrefs: {
            select: {
              emailEnabled: true,
              pushEnabled: true,
              smsEnabled: true,
              preferences: true,
            },
          },
        },
      });

      if (!userData) {
        throw new AppError('Пользователь не найден', 404, 'NOT_FOUND');
      }

      // Формируем ответ в GDPR-compliant формате
      const gdprExport = {
        exportDate: new Date().toISOString(),
        dataSubject: {
          id: userData.id,
          personalInformation: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            timezone: userData.timezone,
          },
          accountInformation: {
            role: userData.role,
            status: userData.status,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
          },
        },
        professionalProfile: userData.specialist || null,
        children: userData.childrenParents,
        reports: userData.reports,
        notifications: userData.userNotifications,
        preferences: userData.notificationPrefs,
        exportMetadata: {
          format: 'JSON',
          version: '1.0',
          compliantWith: 'GDPR Article 20',
        },
      };

      // Устанавливаем заголовки для скачивания файла
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="gdpr-export-${id}-${Date.now()}.json"`
      );

      res.status(200).json(gdprExport);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /users/v1/:id/gdpr/delete
   * GDPR: Запрос на удаление данных пользователя
   * Право на забвение (Article 17 GDPR)
   *
   * Реализация: Soft delete с grace period 30 дней
   */
  async requestDataDeletion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Пользователь может удалить только свои данные
      if (currentUser.userId !== id) {
        throw new AppError('Вы можете удалить только свои данные', 403, 'FORBIDDEN');
      }

      // Проверяем, существует ли пользователь
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });

      if (!user) {
        throw new AppError('Пользователь не найден', 404, 'NOT_FOUND');
      }

      // Проверяем, не запрошено ли уже удаление
      if (user.status === 'deletion_requested') {
        throw new AppError(
          'Запрос на удаление уже обработан. Данные будут удалены в течение 30 дней.',
          400,
          'DELETION_ALREADY_REQUESTED'
        );
      }

      // Soft delete: помечаем пользователя для удаления
      // Фактическое удаление произойдет через 30 дней (grace period)
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);

      await prisma.user.update({
        where: { id },
        data: {
          status: 'deletion_requested',
          // В production добавить поле deletionScheduledAt
        },
      });

      // Публикуем событие для обработки удаления
      await publishEvent({
        aggregateType: 'User',
        aggregateId: id,
        eventType: 'UserDeletionRequested',
        payload: {
          userId: id,
          email: user.email,
          requestedAt: new Date().toISOString(),
          scheduledDeletionDate: deletionDate.toISOString(),
        },
        occurredAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Запрос на удаление данных принят',
        data: {
          userId: id,
          status: 'deletion_requested',
          gracePeriodDays: 30,
          scheduledDeletionDate: deletionDate.toISOString(),
          notice: 'Вы можете отменить удаление, связавшись с поддержкой в течение 30 дней',
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

