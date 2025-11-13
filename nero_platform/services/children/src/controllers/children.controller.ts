/**
 * Children Controller
 * 
 * Контроллер для управления профилями детей
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@neiro/database';
import { AppError } from '../utils/AppError';
import { publishEvent } from '../services/events.service';
import { calculateAge } from '@neiro/utils';

const prisma = new PrismaClient();

export const childrenController = {
  /**
   * POST /children/v1
   * Создание профиля ребенка
   */
  async createChild(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;
      const { firstName, lastName, birthDate, gender, diagnosisSummary, notes } = req.body;

      // Создание ребенка
      const child = await prisma.child.create({
        data: {
          firstName,
          lastName,
          birthDate: new Date(birthDate),
          gender,
          diagnosisSummary,
          notes,
        },
      });

      // Публикация события
      await publishEvent('children.child.created', {
        childId: child.id,
        createdBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        birthDate: child.birthDate,
        gender: child.gender,
        age: calculateAge(child.birthDate),
        diagnosisSummary: child.diagnosisSummary,
        notes: child.notes,
        createdAt: child.createdAt,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /children/v1
   * Получение списка детей с пагинацией
   */
  async listChildren(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;
      const { limit = '20', cursor } = req.query;
      const parsedLimit = Math.min(parseInt(limit as string, 10), 100);

      // Фильтрация по правам доступа
      let where: any = { archivedAt: null };

      // Родители видят только своих детей
      if (currentUser.role === 'parent') {
        where.parents = {
          some: {
            parentUserId: currentUser.userId,
          },
        };
      }
      // Специалисты видят детей, с которыми работают
      else if (currentUser.role === 'specialist') {
        where.specialists = {
          some: {
            specialist: {
              userId: currentUser.userId,
            },
          },
        };
      }
      // Admin и supervisor видят всех

      const children = await prisma.child.findMany({
        where,
        take: parsedLimit + 1,
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor as string },
        }),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          gender: true,
          diagnosisSummary: true,
          createdAt: true,
        },
      });

      const hasMore = children.length > parsedLimit;
      const data = hasMore ? children.slice(0, -1) : children;
      const nextCursor = hasMore ? children[parsedLimit].id : undefined;

      // Добавляем возраст
      const enrichedData = data.map((child) => ({
        ...child,
        age: calculateAge(child.birthDate),
      }));

      res.status(200).json({
        data: enrichedData,
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
   * GET /children/v1/:id
   * Получение профиля ребенка
   */
  async getChild(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      const child = await prisma.child.findUnique({
        where: { id },
        include: {
          parents: {
            include: {
              parent: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          specialists: {
            include: {
              specialist: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!child) {
        throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
      }

      // Проверка прав доступа
      const hasAccess =
        ['admin', 'supervisor'].includes(currentUser.role) ||
        (currentUser.role === 'parent' &&
          child.parents.some((p) => p.parentUserId === currentUser.userId)) ||
        (currentUser.role === 'specialist' &&
          child.specialists.some((s) => s.specialist.userId === currentUser.userId));

      if (!hasAccess) {
        throw new AppError('Недостаточно прав для просмотра профиля', 403, 'FORBIDDEN');
      }

      res.status(200).json({
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        birthDate: child.birthDate,
        age: calculateAge(child.birthDate),
        gender: child.gender,
        diagnosisSummary: child.diagnosisSummary,
        notes: child.notes,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        parents: child.parents.map((p) => ({
          ...p.parent,
          relationship: p.relationship,
          legalGuardian: p.legalGuardian,
          linkedAt: p.linkedAt,
        })),
        specialists: child.specialists.map((s) => ({
          id: s.specialist.id,
          user: s.specialist.user,
          specialty: s.specialist.specialty,
          specialization: s.specialization,
          isPrimary: s.isPrimary,
          assignedAt: s.assignedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /children/v1/:id
   * Обновление профиля ребенка
   */
  async updateChild(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const updateData = req.body;

      // Преобразование birthDate если присутствует
      if (updateData.birthDate) {
        updateData.birthDate = new Date(updateData.birthDate);
      }

      // Проверка прав (только специалисты и admin)
      if (!['specialist', 'supervisor', 'admin'].includes(currentUser.role)) {
        throw new AppError('Недостаточно прав для обновления профиля', 403, 'FORBIDDEN');
      }

      const child = await prisma.child.update({
        where: { id },
        data: updateData,
      });

      // Публикация события
      await publishEvent('children.child.updated', {
        childId: child.id,
        updatedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        ...child,
        age: calculateAge(child.birthDate),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /children/v1/:id
   * Архивация ребенка (soft delete)
   */
  async archiveChild(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      await prisma.child.update({
        where: { id },
        data: { archivedAt: new Date() },
      });

      // Публикация события
      await publishEvent('children.child.archived', {
        childId: id,
        archivedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /children/v1/:id/parents
   * Добавление родителя к ребенку
   */
  async addParent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const { parentUserId, relationship, legalGuardian } = req.body;

      // Проверка существования ребенка и родителя
      const child = await prisma.child.findUnique({ where: { id } });
      if (!child) {
        throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
      }

      const parent = await prisma.user.findUnique({ where: { id: parentUserId } });
      if (!parent || parent.role !== 'parent') {
        throw new AppError('Родитель не найден или неверная роль', 404, 'PARENT_NOT_FOUND');
      }

      // Создание связи
      const childParent = await prisma.childParent.create({
        data: {
          childId: id,
          parentUserId,
          relationship,
          legalGuardian: legalGuardian || false,
          linkedAt: new Date(),
        },
      });

      // Публикация события
      await publishEvent('children.parent.linked', {
        childId: id,
        parentId: parentUserId,
        linkedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json(childParent);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /children/v1/:id/parents/:parentId
   * Удаление родителя от ребенка
   */
  async removeParent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, parentId } = req.params;
      const currentUser = (req as any).user;

      await prisma.childParent.deleteMany({
        where: {
          childId: id,
          parentUserId: parentId,
        },
      });

      // Публикация события
      await publishEvent('children.parent.unlinked', {
        childId: id,
        parentId,
        unlinkedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /children/v1/:id/specialists
   * Назначение специалиста ребенку
   */
  async assignSpecialist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const { specialistId, specialization, isPrimary, roleDescription } = req.body;

      // Проверка существования
      const child = await prisma.child.findUnique({ where: { id } });
      if (!child) {
        throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
      }

      const specialist = await prisma.specialist.findUnique({ where: { id: specialistId } });
      if (!specialist) {
        throw new AppError('Специалист не найден', 404, 'SPECIALIST_NOT_FOUND');
      }

      // Создание связи
      const childSpecialist = await prisma.childSpecialist.create({
        data: {
          childId: id,
          specialistId,
          specialization,
          isPrimary: isPrimary || false,
          roleDescription,
        },
      });

      // Публикация события
      await publishEvent('children.specialist.assigned', {
        childId: id,
        specialistId,
        assignedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json(childSpecialist);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /children/v1/:id/specialists/:specialistId
   * Снятие специалиста с ребенка
   */
  async unassignSpecialist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, specialistId } = req.params;
      const currentUser = (req as any).user;

      // Обновляем запись, устанавливая дату снятия
      await prisma.childSpecialist.updateMany({
        where: {
          childId: id,
          specialistId,
          releasedAt: null,
        },
        data: {
          releasedAt: new Date(),
        },
      });

      // Публикация события
      await publishEvent('children.specialist.unassigned', {
        childId: id,
        specialistId,
        unassignedBy: currentUser.userId,
        timestamp: new Date().toISOString(),
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

