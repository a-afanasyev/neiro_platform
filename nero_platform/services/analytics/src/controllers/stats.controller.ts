import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { statsService } from '../services/stats.service';
import { ValidationError, ForbiddenError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class StatsController {
  /**
   * GET /analytics/v1/child/:childId/stats
   * Получить статистику ребенка
   */
  async getChildStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { childId } = req.params;
      const { days } = req.query;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!childId) {
        throw new ValidationError('Child ID is required');
      }

      // Проверка прав доступа
      if (userRole === 'parent') {
        // Родитель может видеть только своего ребенка
        const { PrismaClient } = await import('@neiro/database');
        const prisma = new PrismaClient();

        const childParent = await prisma.childParent.findFirst({
          where: {
            childId,
            parentUserId: userId,
          },
        });

        if (!childParent) {
          throw new ForbiddenError('Access denied');
        }
      } else if (userRole === 'specialist') {
        // Специалист может видеть детей, с которыми работает
        const { PrismaClient } = await import('@neiro/database');
        const prisma = new PrismaClient();

        const specialist = await prisma.specialist.findUnique({
          where: { userId },
        });

        if (!specialist) {
          throw new ForbiddenError('Specialist profile not found');
        }

        const childSpecialist = await prisma.childSpecialist.findFirst({
          where: {
            childId,
            specialistId: specialist.id,
          },
        });

        if (!childSpecialist) {
          throw new ForbiddenError('Access denied');
        }
      }
      // Admin/Supervisor могут видеть всё

      const daysNum = days ? parseInt(days as string) : 30;
      const stats = await statsService.getChildStats(childId, daysNum);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/v1/specialist/:specialistId/stats
   * Получить статистику специалиста
   */
  async getSpecialistStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { specialistId } = req.params;
      const { days } = req.query;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!specialistId) {
        throw new ValidationError('Specialist ID is required');
      }

      // Проверка прав доступа
      if (userRole === 'specialist') {
        // Специалист может видеть только свою статистику
        const { PrismaClient } = await import('@neiro/database');
        const prisma = new PrismaClient();

        const specialist = await prisma.specialist.findUnique({
          where: { userId },
        });

        if (!specialist || specialist.id !== specialistId) {
          throw new ForbiddenError('Access denied');
        }
      }
      // Admin/Supervisor могут видеть всё
      // Parent не может видеть статистику специалистов

      if (userRole === 'parent') {
        throw new ForbiddenError('Access denied');
      }

      const daysNum = days ? parseInt(days as string) : 30;
      const stats = await statsService.getSpecialistStats(specialistId, daysNum);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /analytics/v1/cache/invalidate
   * Инвалидировать кэш статистики (admin only)
   */
  async invalidateCache(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, id } = req.body;

      if (!type || !id) {
        throw new ValidationError('Type and ID are required');
      }

      if (!['child', 'specialist'].includes(type)) {
        throw new ValidationError('Invalid type. Must be "child" or "specialist"');
      }

      await statsService.invalidateCache(type, id);

      logger.info('Cache invalidated manually', {
        type,
        id,
        userId: req.user!.userId,
      });

      res.json({
        success: true,
        message: 'Cache invalidated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
