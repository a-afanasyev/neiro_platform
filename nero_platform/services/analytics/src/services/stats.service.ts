import { PrismaClient } from '@neiro/database';
import { logger } from '../utils/logger';
import { redisService } from './redis.service';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface ChildStats {
  childId: string;
  childName: string;
  totalAssignments: number;
  completedAssignments: number;
  completionRate: number;
  totalReports: number;
  averageDuration: number;
  moodDistribution: {
    good: number;
    neutral: number;
    difficult: number;
  };
  recentActivity: Array<{
    date: string;
    assignmentsCompleted: number;
    reportsSubmitted: number;
  }>;
  progressTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
}

export interface SpecialistStats {
  specialistId: string;
  specialistName: string;
  totalChildren: number;
  totalAssignments: number;
  totalReports: number;
  averageReviewTime: number; // in hours
  approvalRate: number;
  childrenProgress: Array<{
    childId: string;
    childName: string;
    completionRate: number;
    lastActivity: string;
  }>;
}

export class StatsService {
  /**
   * Получить статистику ребенка
   */
  async getChildStats(childId: string, days: number = 30): Promise<ChildStats> {
    const cacheKey = redisService.constructor.generateKey('child', childId, days);

    // Попытка получить из кэша
    const cached = await redisService.get<ChildStats>(cacheKey);
    if (cached) {
      logger.info('Child stats from cache', { childId });
      return cached;
    }

    // Получить данные ребенка
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true, lastName: true },
    });

    if (!child) {
      throw new Error('Child not found');
    }

    const since = subDays(new Date(), days);

    // Получить статистику назначений
    const [assignments, reports] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          childId,
          assignedAt: { gte: since },
        },
        select: {
          id: true,
          status: true,
          assignedAt: true,
        },
      }),
      prisma.report.findMany({
        where: {
          assignment: { childId },
          submittedAt: { gte: since },
        },
        select: {
          submittedAt: true,
          durationMinutes: true,
          childMood: true,
        },
      }),
    ]);

    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    // Средняя длительность
    const averageDuration =
      reports.length > 0
        ? reports.reduce((sum, r) => sum + r.durationMinutes, 0) / reports.length
        : 0;

    // Распределение настроений
    const moodDistribution = {
      good: reports.filter((r) => r.childMood === 'good').length,
      neutral: reports.filter((r) => r.childMood === 'neutral').length,
      difficult: reports.filter((r) => r.childMood === 'difficult').length,
    };

    // Активность по дням (последние 7 дней)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayAssignments = assignments.filter(
        (a) => a.status === 'completed' && a.assignedAt >= dayStart && a.assignedAt <= dayEnd
      ).length;

      const dayReports = reports.filter(
        (r) => r.submittedAt >= dayStart && r.submittedAt <= dayEnd
      ).length;

      recentActivity.push({
        date: format(date, 'yyyy-MM-dd'),
        assignmentsCompleted: dayAssignments,
        reportsSubmitted: dayReports,
      });
    }

    // Тренд прогресса (упрощенная версия)
    let progressTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data' = 'insufficient_data';
    if (recentActivity.length >= 5) {
      const firstHalf = recentActivity.slice(0, 3).reduce((sum, day) => sum + day.assignmentsCompleted, 0);
      const secondHalf = recentActivity.slice(3).reduce((sum, day) => sum + day.assignmentsCompleted, 0);

      if (secondHalf > firstHalf * 1.2) {
        progressTrend = 'improving';
      } else if (secondHalf < firstHalf * 0.8) {
        progressTrend = 'declining';
      } else {
        progressTrend = 'stable';
      }
    }

    const stats: ChildStats = {
      childId,
      childName: `${child.firstName} ${child.lastName}`,
      totalAssignments,
      completedAssignments,
      completionRate: Math.round(completionRate * 10) / 10,
      totalReports: reports.length,
      averageDuration: Math.round(averageDuration),
      moodDistribution,
      recentActivity,
      progressTrend,
    };

    // Сохранить в кэш на 5 минут
    await redisService.set(cacheKey, stats, 300);

    return stats;
  }

  /**
   * Получить статистику специалиста
   */
  async getSpecialistStats(specialistId: string, days: number = 30): Promise<SpecialistStats> {
    const cacheKey = redisService.constructor.generateKey('specialist', specialistId, days);

    // Попытка получить из кэша
    const cached = await redisService.get<SpecialistStats>(cacheKey);
    if (cached) {
      logger.info('Specialist stats from cache', { specialistId });
      return cached;
    }

    // Получить данные специалиста
    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId },
      select: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!specialist) {
      throw new Error('Specialist not found');
    }

    const since = subDays(new Date(), days);

    // Получить детей специалиста
    const childrenSpecialists = await prisma.childSpecialist.findMany({
      where: { specialistId },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const childIds = childrenSpecialists.map((cs) => cs.child.id);

    // Получить назначения и отчеты
    const [assignments, reports, reviews] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          childId: { in: childIds },
          assignedAt: { gte: since },
        },
      }),
      prisma.report.findMany({
        where: {
          assignment: { childId: { in: childIds } },
          submittedAt: { gte: since },
        },
      }),
      prisma.reportReview.findMany({
        where: {
          specialistId,
          reviewedAt: { gte: since },
        },
        include: {
          report: {
            select: {
              submittedAt: true,
            },
          },
        },
      }),
    ]);

    // Средн��е время проверки
    let averageReviewTime = 0;
    if (reviews.length > 0) {
      const totalHours = reviews.reduce((sum, review) => {
        const submittedAt = review.report.submittedAt;
        const reviewedAt = review.reviewedAt;
        const diffMs = reviewedAt.getTime() - submittedAt.getTime();
        return sum + diffMs / (1000 * 60 * 60); // to hours
      }, 0);
      averageReviewTime = totalHours / reviews.length;
    }

    // Процент одобренных
    const approvedReviews = reviews.filter((r) => r.reviewStatus === 'approved').length;
    const approvalRate = reviews.length > 0 ? (approvedReviews / reviews.length) * 100 : 0;

    // Прогресс детей
    const childrenProgress = await Promise.all(
      childrenSpecialists.slice(0, 10).map(async (cs) => {
        const childAssignments = assignments.filter((a) => a.childId === cs.child.id);
        const completed = childAssignments.filter((a) => a.status === 'completed').length;
        const completionRate =
          childAssignments.length > 0 ? (completed / childAssignments.length) * 100 : 0;

        const lastAssignment = childAssignments.sort(
          (a, b) => b.assignedAt.getTime() - a.assignedAt.getTime()
        )[0];

        return {
          childId: cs.child.id,
          childName: `${cs.child.firstName} ${cs.child.lastName}`,
          completionRate: Math.round(completionRate * 10) / 10,
          lastActivity: lastAssignment ? format(lastAssignment.assignedAt, 'yyyy-MM-dd') : 'N/A',
        };
      })
    );

    const stats: SpecialistStats = {
      specialistId,
      specialistName: `${specialist.user.firstName} ${specialist.user.lastName}`,
      totalChildren: childIds.length,
      totalAssignments: assignments.length,
      totalReports: reports.length,
      averageReviewTime: Math.round(averageReviewTime * 10) / 10,
      approvalRate: Math.round(approvalRate * 10) / 10,
      childrenProgress,
    };

    // Сохранить в кэш на 5 минут
    await redisService.set(cacheKey, stats, 300);

    return stats;
  }

  /**
   * Инвалидировать кэш статистики
   */
  async invalidateCache(type: 'child' | 'specialist', id: string): Promise<void> {
    const pattern = redisService.constructor.generateKey(type, id, '*');
    const deleted = await redisService.delPattern(pattern);
    logger.info('Cache invalidated', { type, id, deleted });
  }
}

export const statsService = new StatsService();
