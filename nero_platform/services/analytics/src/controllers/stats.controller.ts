import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { statsService } from '../services/stats.service';
import { ValidationError, ForbiddenError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const parseDateParam = (value?: string | string[]): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const rawValue = Array.isArray(value) ? value[0] : value;
  const date = new Date(rawValue);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const parseStringParam = (value?: string | string[]): string | undefined => {
  if (!value) {
    return undefined;
  }

  return (Array.isArray(value) ? value[0] : value).trim() || undefined;
};

export class StatsController {
  /**
   * GET /analytics/v1/children/:childId
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
   * GET /analytics/v1/children/:childId/assignments-stats
   * Детальная статистика назначений ребенка
   */
  async getAssignmentsStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { childId } = req.params;
      if (!childId) {
        throw new ValidationError('Child ID is required');
      }

      const stats = await statsService.getAssignmentsStats(childId, {
        dateFrom: parseDateParam(req.query.dateFrom as string | string[] | undefined),
        dateTo: parseDateParam(req.query.dateTo as string | string[] | undefined),
        exerciseCategory: parseStringParam(
          req.query.exerciseCategory as string | string[] | undefined
        ),
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/v1/children/:childId/goals-progress
   * Прогресс по целям маршрута ребенка
   */
  async getGoalsProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { childId } = req.params;
      if (!childId) {
        throw new ValidationError('Child ID is required');
      }

      const goalsProgress = await statsService.getGoalsProgress(childId);

      res.json({
        success: true,
        data: goalsProgress,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/v1/children/:childId/timeline
   * Временная шкала активности ребенка
   */
  async getTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { childId } = req.params;
      if (!childId) {
        throw new ValidationError('Child ID is required');
      }

      const limitParam = parseInt((req.query.limit as string) || '25', 10);
      const limit = Number.isNaN(limitParam) ? 25 : Math.min(Math.max(limitParam, 5), 100);
      const eventTypesRaw = req.query.eventTypes as string | string[] | undefined;
      const eventTypes = eventTypesRaw
        ? (Array.isArray(eventTypesRaw) ? eventTypesRaw : eventTypesRaw.split(','))
            .map((value) => value.trim())
            .filter(Boolean)
        : undefined;

      const timeline = await statsService.getTimeline(childId, {
        dateFrom: parseDateParam(req.query.dateFrom as string | string[] | undefined),
        dateTo: parseDateParam(req.query.dateTo as string | string[] | undefined),
        eventTypes,
        limit,
        cursor: parseStringParam(req.query.cursor as string | string[] | undefined),
      });

      res.json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/v1/routes/:routeId/progress
   * Прогресс маршрута
   */
  async getRouteProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { routeId } = req.params;
      if (!routeId) {
        throw new ValidationError('Route ID is required');
      }

      const progress = await statsService.getRouteProgress(routeId);

      res.json({
        success: true,
        data: progress,
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
