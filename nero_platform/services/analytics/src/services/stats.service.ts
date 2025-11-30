import { PrismaClient } from '@neiro/database';
import { logger } from '../utils/logger';
import { redisService } from './redis.service';
import { startOfDay, endOfDay, subDays, format, startOfWeek } from 'date-fns';

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

interface AssignmentsStatsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  exerciseCategory?: string;
}

interface AssignmentsStatsResponse {
  period: {
    start: string;
    end: string;
  };
  byCategory: Array<{
    category: string;
    assigned: number;
    completed: number;
    completionRate: number;
    avgDuration: number;
  }>;
  byWeek: Array<{
    weekStart: string;
    assigned: number;
    completed: number;
    overdue: number;
    completionRate: number;
    avgDuration: number;
  }>;
  trends: {
    completionRateTrend: string;
    avgDurationTrend: string;
  };
}

interface GoalsProgressResponse {
  routeId: string;
  routeTitle: string;
  childId: string;
  childName: string;
  goals: Array<{
    goalId: string;
    category: string;
    description: string;
    status: string;
    progress: number;
    baseline: string | null;
    current: string | null;
    target: string | null;
    relatedAssignments: number;
    completedAssignments: number;
    lastUpdated: string | null;
  }>;
  summary: {
    totalGoals: number;
    achieved: number;
    onTrack: number;
    atRisk: number;
  };
}

interface TimelineOptions {
  dateFrom?: Date;
  dateTo?: Date;
  eventTypes?: string[];
  limit: number;
  cursor?: string;
}

interface TimelineEvent {
  timestamp: string;
  type: string;
  title: string;
  status?: string | null;
  relatedId?: string | null;
  metadata?: Record<string, unknown>;
}

interface TimelineResponse {
  events: TimelineEvent[];
  pagination: {
    total: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

interface RouteProgressResponse {
  routeId: string;
  childId: string;
  childName: string;
  status: string;
  overallProgress: number;
  assignments: {
    total: number;
    completed: number;
    overdue: number;
  };
  phases: Array<{
    phaseId: string;
    name: string;
    status: string;
    progress: number;
    startDate: string | null;
    endDate: string | null;
    completedAssignments: number;
    totalAssignments: number;
  }>;
  milestones: {
    total: number;
    completed: number;
    upcoming: number;
    overdue: number;
  };
}

export class StatsService {
  private normalizeDateRange(dateFrom?: Date, dateTo?: Date, defaultDays: number = 30) {
    let endDate = endOfDay(dateTo ?? new Date());
    let startDate = startOfDay(dateFrom ?? subDays(endDate, defaultDays));

    if (startDate > endDate) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
    }

    return { startDate, endDate };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) {
      return 0;
    }

    const half = Math.floor(values.length / 2);
    if (half === 0 || half === values.length) {
      return 0;
    }

    const firstAvg =
      values.slice(0, half).reduce((sum, value) => sum + value, 0) / half;
    const secondAvg =
      values.slice(half).reduce((sum, value) => sum + value, 0) / (values.length - half);

    return Number((secondAvg - firstAvg).toFixed(1));
  }

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
   * Получить детальную статистику назначений
   */
  async getAssignmentsStats(
    childId: string,
    filters: AssignmentsStatsFilters = {}
  ): Promise<AssignmentsStatsResponse> {
    const { startDate, endDate } = this.normalizeDateRange(filters.dateFrom, filters.dateTo);

    const cacheKey = redisService.constructor.generateKey(
      'assignments-stats',
      childId,
      startDate.toISOString(),
      endDate.toISOString(),
      filters.exerciseCategory || 'all'
    );

    const cached = await redisService.get<AssignmentsStatsResponse>(cacheKey as string);
    if (cached) {
      logger.info('Assignments stats from cache', { childId });
      return cached;
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        childId,
        assignedAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(filters.exerciseCategory
          ? {
              exercise: {
                category: filters.exerciseCategory,
              },
            }
          : {}),
      },
      include: {
        exercise: {
          select: { category: true, title: true },
        },
        reports: {
          select: {
            durationMinutes: true,
            submittedAt: true,
          },
        },
      },
    });

    const byCategoryMap = new Map<
      string,
      { assigned: number; completed: number; durationSum: number; durationCount: number }
    >();
    const byWeekMap = new Map<
      string,
      {
        assigned: number;
        completed: number;
        overdue: number;
        durationSum: number;
        durationCount: number;
      }
    >();

    assignments.forEach((assignment) => {
      const category = assignment.exercise?.category || 'unspecified';
      if (!byCategoryMap.has(category)) {
        byCategoryMap.set(category, {
          assigned: 0,
          completed: 0,
          durationSum: 0,
          durationCount: 0,
        });
      }

      const categoryEntry = byCategoryMap.get(category)!;
      categoryEntry.assigned += 1;
      if (assignment.status === 'completed') {
        categoryEntry.completed += 1;
      }
      const reportDuration = assignment.reports.reduce((sum, report) => sum + report.durationMinutes, 0);
      if (assignment.reports.length > 0) {
        categoryEntry.durationSum += reportDuration;
        categoryEntry.durationCount += assignment.reports.length;
      }

      const weekStart = format(
        startOfWeek(assignment.assignedAt, { weekStartsOn: 1 }),
        'yyyy-MM-dd'
      );

      if (!byWeekMap.has(weekStart)) {
        byWeekMap.set(weekStart, {
          assigned: 0,
          completed: 0,
          overdue: 0,
          durationSum: 0,
          durationCount: 0,
        });
      }

      const weekEntry = byWeekMap.get(weekStart)!;
      weekEntry.assigned += 1;
      if (assignment.status === 'completed') {
        weekEntry.completed += 1;
      }
      if (assignment.status === 'overdue') {
        weekEntry.overdue += 1;
      }
      if (assignment.reports.length > 0) {
        weekEntry.durationSum += reportDuration;
        weekEntry.durationCount += assignment.reports.length;
      }
    });

    const byCategory = Array.from(byCategoryMap.entries()).map(([category, stats]) => ({
      category,
      assigned: stats.assigned,
      completed: stats.completed,
      completionRate:
        stats.assigned > 0 ? Number(((stats.completed / stats.assigned) * 100).toFixed(1)) : 0,
      avgDuration:
        stats.durationCount > 0
          ? Number((stats.durationSum / stats.durationCount).toFixed(1))
          : 0,
    }));

    const byWeek = Array.from(byWeekMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([weekStart, stats]) => {
        const completionRate =
          stats.assigned > 0 ? Number(((stats.completed / stats.assigned) * 100).toFixed(1)) : 0;
        const avgDuration =
          stats.durationCount > 0
            ? Number((stats.durationSum / stats.durationCount).toFixed(1))
            : 0;

        return {
          weekStart,
          assigned: stats.assigned,
          completed: stats.completed,
          overdue: stats.overdue,
          completionRate,
          avgDuration,
        };
      });

    const completionTrend = this.calculateTrend(byWeek.map((week) => week.completionRate));
    const durationTrend = this.calculateTrend(byWeek.map((week) => week.avgDuration));

    const response: AssignmentsStatsResponse = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      byCategory,
      byWeek,
      trends: {
        completionRateTrend: `${completionTrend >= 0 ? '+' : ''}${completionTrend.toFixed(1)}%`,
        avgDurationTrend: `${durationTrend >= 0 ? '+' : ''}${durationTrend.toFixed(1)}min`,
      },
    };

    await redisService.set(cacheKey as string, response, 180);

    return response;
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
   * Получить прогресс по целям маршрута
   */
  async getGoalsProgress(childId: string): Promise<GoalsProgressResponse> {
    const cacheKey = redisService.constructor.generateKey('goals-progress', childId);
    const cached = await redisService.get<GoalsProgressResponse>(cacheKey as string);
    if (cached) {
      logger.info('Goals progress from cache', { childId });
      return cached;
    }

    let route = await prisma.route.findFirst({
      where: {
        childId,
        status: 'active',
      },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!route) {
      route = await prisma.route.findFirst({
        where: { childId },
        orderBy: { updatedAt: 'desc' },
        include: {
          child: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    if (!route) {
      throw new Error('Route not found for child');
    }

    const [goals, assignments] = await Promise.all([
      prisma.routeGoal.findMany({
        where: { routeId: route.id },
        include: {
          milestones: {
            select: { status: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.assignment.findMany({
        where: { routeId: route.id },
        select: {
          id: true,
          targetGoalId: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

    const goalsData = goals.map((goal) => {
      const relatedAssignments = assignments.filter(
        (assignment) => assignment.targetGoalId === goal.id
      );
      const completedAssignments = relatedAssignments.filter(
        (assignment) => assignment.status === 'completed'
      ).length;
      const progress =
        relatedAssignments.length > 0
          ? Number(((completedAssignments / relatedAssignments.length) * 100).toFixed(1))
          : 0;

      const lastUpdated =
        relatedAssignments
          .filter((assignment) => assignment.updatedAt)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]?.updatedAt ??
        goal.updatedAt;

      const baselineValue = goal.baselineValue ? Number(goal.baselineValue) : null;
      const targetValue = goal.targetValue ? Number(goal.targetValue) : null;
      const currentValue =
        baselineValue !== null && targetValue !== null
          ? baselineValue + ((targetValue - baselineValue) * progress) / 100
          : null;

      return {
        goalId: goal.id,
        category: goal.category,
        description: goal.description,
        status: goal.status,
        progress,
        baseline: baselineValue !== null ? baselineValue.toString() : null,
        current: currentValue !== null ? currentValue.toFixed(2) : null,
        target: targetValue !== null ? targetValue.toString() : null,
        relatedAssignments: relatedAssignments.length,
        completedAssignments,
        lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
      };
    });

    const goalsSummary = {
      totalGoals: goalsData.length,
      achieved: goalsData.filter(
        (goal) => goal.progress >= 90 || goal.status === 'completed'
      ).length,
      onTrack: goalsData.filter((goal) => goal.progress >= 60 && goal.progress < 90).length,
      atRisk: goalsData.filter((goal) => goal.progress < 60).length,
    };

    const response: GoalsProgressResponse = {
      routeId: route.id,
      routeTitle: route.title,
      childId: route.childId,
      childName: `${route.child.firstName} ${route.child.lastName}`,
      goals: goalsData,
      summary: goalsSummary,
    };

    await redisService.set(cacheKey as string, response, 180);

    return response;
  }

  /**
   * Получить временную шкалу активности
   */
  async getTimeline(childId: string, options: TimelineOptions): Promise<TimelineResponse> {
    const { startDate, endDate } = this.normalizeDateRange(options.dateFrom, options.dateTo, 14);
    const cacheKey = redisService.constructor.generateKey(
      'timeline',
      childId,
      startDate.toISOString(),
      endDate.toISOString(),
      options.eventTypes?.join(',') || 'all',
      options.cursor || 'start',
      options.limit
    );

    const cached = await redisService.get<TimelineResponse>(cacheKey as string);
    if (cached) {
      logger.info('Timeline from cache', { childId });
      return cached;
    }

    const [reports, assignments, history, milestones] = await Promise.all([
      prisma.report.findMany({
        where: {
          assignment: {
            childId,
          },
          submittedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          assignment: {
            select: {
              exercise: {
                select: { title: true },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        take: 200,
      }),
      prisma.assignment.findMany({
        where: {
          childId,
          assignedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          exercise: {
            select: { title: true },
          },
        },
        orderBy: { assignedAt: 'desc' },
        take: 200,
      }),
      prisma.assignmentHistory.findMany({
        where: {
          assignment: {
            childId,
          },
          changedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          assignment: {
            select: {
              exercise: {
                select: { title: true },
              },
            },
          },
        },
        orderBy: { changedAt: 'desc' },
        take: 200,
      }),
      prisma.routePhaseMilestone.findMany({
        where: {
          phase: {
            route: {
              childId,
            },
          },
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          phase: {
            select: {
              name: true,
              route: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 200,
      }),
    ]);

    let events: TimelineEvent[] = [];

    reports.forEach((report) => {
      events.push({
        timestamp: report.submittedAt.toISOString(),
        type: 'report_submitted',
        title: `Отчет: ${report.assignment?.exercise?.title ?? 'упражнение'}`,
        status: report.status,
        relatedId: report.id,
        metadata: {
          duration: report.durationMinutes,
          childMood: report.childMood,
        },
      });
    });

    assignments.forEach((assignment) => {
      events.push({
        timestamp: assignment.assignedAt.toISOString(),
        type: 'assignment_created',
        title: `Назначение: ${assignment.exercise?.title ?? 'упражнение'}`,
        status: assignment.status,
        relatedId: assignment.id,
        metadata: {
          dueDate: assignment.dueDate,
        },
      });
    });

    history.forEach((entry) => {
      events.push({
        timestamp: entry.changedAt.toISOString(),
        type: 'assignment_status_change',
        title: `Статус назначения: ${entry.toStatus ?? entry.eventType}`,
        status: entry.toStatus,
        relatedId: entry.assignmentId,
        metadata: {
          fromStatus: entry.fromStatus,
          toStatus: entry.toStatus,
        },
      });
    });

    milestones.forEach((milestone) => {
      events.push({
        timestamp: milestone.completedAt?.toISOString() ?? new Date().toISOString(),
        type: 'milestone_completed',
        title: `Контрольная точка: ${milestone.title}`,
        status: milestone.status,
        relatedId: milestone.id,
        metadata: {
          phase: milestone.phase.name,
          routeTitle: milestone.phase.route.title,
        },
      });
    });

    if (options.eventTypes && options.eventTypes.length > 0) {
      const allowed = new Set(options.eventTypes);
      events = events.filter((event) => allowed.has(event.type));
    }

    if (options.cursor) {
      events = events.filter(
        (event) => new Date(event.timestamp).getTime() < new Date(options.cursor!).getTime()
      );
    }

    events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const total = events.length;
    const hasMore = total > options.limit;
    const limitedEvents = events.slice(0, options.limit);
    const nextCursor = hasMore
      ? limitedEvents[limitedEvents.length - 1].timestamp
      : null;

    const response: TimelineResponse = {
      events: limitedEvents,
      pagination: {
        total,
        hasMore,
        nextCursor,
      },
    };

    await redisService.set(cacheKey as string, response, 120);

    return response;
  }

  /**
   * Получить прогресс по маршруту
   */
  async getRouteProgress(routeId: string): Promise<RouteProgressResponse> {
    const cacheKey = redisService.constructor.generateKey('route-progress', routeId);
    const cached = await redisService.get<RouteProgressResponse>(cacheKey as string);
    if (cached) {
      logger.info('Route progress from cache', { routeId });
      return cached;
    }

    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        assignments: {
          select: {
            id: true,
            status: true,
            phaseId: true,
          },
        },
        phases: {
          include: {
            milestones: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!route) {
      throw new Error('Route not found');
    }

    const totalAssignments = route.assignments.length;
    const completedAssignments = route.assignments.filter(
      (assignment) => assignment.status === 'completed'
    ).length;
    const overdueAssignments = route.assignments.filter(
      (assignment) => assignment.status === 'overdue'
    ).length;

    const overallProgress =
      totalAssignments > 0
        ? Number(((completedAssignments / totalAssignments) * 100).toFixed(1))
        : 0;

    const phases = route.phases.map((phase) => {
      const phaseAssignments = route.assignments.filter(
        (assignment) => assignment.phaseId === phase.id
      );
      const phaseCompleted = phaseAssignments.filter(
        (assignment) => assignment.status === 'completed'
      ).length;
      const phaseProgress =
        phaseAssignments.length > 0
          ? Number(((phaseCompleted / phaseAssignments.length) * 100).toFixed(1))
          : 0;

      return {
        phaseId: phase.id,
        name: phase.name,
        status: phase.status,
        progress: phaseProgress,
        startDate: phase.startDate ? phase.startDate.toISOString() : null,
        endDate: phase.endDate ? phase.endDate.toISOString() : null,
        completedAssignments: phaseCompleted,
        totalAssignments: phaseAssignments.length,
      };
    });

    const milestoneStats = route.phases.flatMap((phase) => phase.milestones);
    const milestonesSummary = {
      total: milestoneStats.length,
      completed: milestoneStats.filter((milestone) => milestone.status === 'completed').length,
      upcoming: milestoneStats.filter((milestone) => milestone.status === 'planned').length,
      overdue: milestoneStats.filter((milestone) => milestone.status === 'overdue').length,
    };

    const response: RouteProgressResponse = {
      routeId: route.id,
      childId: route.childId,
      childName: `${route.child.firstName} ${route.child.lastName}`,
      status: route.status,
      overallProgress,
      assignments: {
        total: totalAssignments,
        completed: completedAssignments,
        overdue: overdueAssignments,
      },
      phases,
      milestones: milestonesSummary,
    };

    await redisService.set(cacheKey as string, response, 300);

    return response;
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
