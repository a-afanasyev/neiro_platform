/**
 * Analytics API Type Definitions & Validation Schemas
 *
 * Соответствует API_CONTRACTS_MVP.md v0.9 Section 11 (Analytics Service)
 * Включает как высокоуровневые dashboard endpoints, так и детализированные data endpoints
 */

import { z } from 'zod';
import { ChildMoodSchema } from './reports';

// ============================================================================
// Common Analytics Types
// ============================================================================

export const GoalStatusSchema = z.enum(['achieved', 'onTrack', 'atRisk', 'notStarted']);
export type GoalStatus = z.infer<typeof GoalStatusSchema>;

export const EventTypeSchema = z.enum([
  'report_submitted',
  'assignment_created',
  'milestone_completed',
  'goal_achieved',
  'route_started',
]);
export type EventType = z.infer<typeof EventTypeSchema>;

// ============================================================================
// Child Progress Analytics (Section 11.1)
// ============================================================================

/**
 * GET /analytics/v1/children/:childId/progress
 * API_CONTRACTS_MVP.md:859-902
 */
export const ChildProgressResponseSchema = z.object({
  childId: z.string().uuid(),
  routeId: z.string().uuid(),
  overallProgress: z.number().min(0).max(100),
  assignments: z.object({
    total: z.number().int().min(0),
    completed: z.number().int().min(0),
    completionRate: z.number().min(0).max(100),
    averageDuration: z.number().min(0),
    overdueCount: z.number().int().min(0),
  }),
  goals: z.object({
    total: z.number().int().min(0),
    achieved: z.number().int().min(0),
    inProgress: z.number().int().min(0),
    notStarted: z.number().int().min(0),
  }),
  performance: z.object({
    avgChildMood: ChildMoodSchema,
    avgCompletionQuality: z.number().min(0).max(100),
    consistencyScore: z.number().min(0).max(1),
  }),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});
export type ChildProgressResponse = z.infer<typeof ChildProgressResponseSchema>;

/**
 * GET /analytics/v1/children/:childId/assignments-stats
 * API_CONTRACTS_MVP.md:904-959
 */
export const AssignmentsStatsResponseSchema = z.object({
  childId: z.string().uuid(),
  period: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  overall: z.object({
    total: z.number().int().min(0),
    completed: z.number().int().min(0),
    completionRate: z.number().min(0).max(100),
    averageDuration: z.number().min(0),
  }),
  byCategory: z.array(z.object({
    category: z.string(),
    count: z.number().int().min(0),
    completionRate: z.number().min(0).max(100),
    avgDuration: z.number().min(0),
  })),
  byWeek: z.array(z.object({
    weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    completed: z.number().int().min(0),
    total: z.number().int().min(0),
    trend: z.number(),
  })),
});
export type AssignmentsStatsResponse = z.infer<typeof AssignmentsStatsResponseSchema>;

/**
 * GET /analytics/v1/children/:childId/goals-progress
 * API_CONTRACTS_MVP.md:961-1021
 */
export const GoalsProgressResponseSchema = z.object({
  childId: z.string().uuid(),
  routeId: z.string().uuid(),
  goals: z.array(z.object({
    goalId: z.string().uuid(),
    title: z.string(),
    status: GoalStatusSchema,
    progress: z.number().min(0).max(100),
    baseline: z.number().nullable(),
    current: z.number().nullable(),
    target: z.number().nullable(),
    unit: z.string(),
    lastUpdated: z.string().datetime(),
  })),
  summary: z.object({
    total: z.number().int().min(0),
    achieved: z.number().int().min(0),
    onTrack: z.number().int().min(0),
    atRisk: z.number().int().min(0),
    notStarted: z.number().int().min(0),
  }),
});
export type GoalsProgressResponse = z.infer<typeof GoalsProgressResponseSchema>;

/**
 * GET /analytics/v1/children/:childId/timeline
 * API_CONTRACTS_MVP.md:1023-1056
 */
export const TimelineEventSchema = z.object({
  id: z.string().uuid(),
  type: EventTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  entityId: z.string().uuid(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const ChildTimelineResponseSchema = z.object({
  childId: z.string().uuid(),
  events: z.array(TimelineEventSchema),
  pagination: z.object({
    cursor: z.string().optional(),
    hasMore: z.boolean(),
  }),
});
export type ChildTimelineResponse = z.infer<typeof ChildTimelineResponseSchema>;

// ============================================================================
// Route Progress Analytics
// ============================================================================

/**
 * GET /analytics/v1/routes/:routeId/progress
 * API_CONTRACTS_MVP.md:1058-1114
 */
export const RouteProgressResponseSchema = z.object({
  routeId: z.string().uuid(),
  childId: z.string().uuid(),
  title: z.string(),
  overallProgress: z.number().min(0).max(100),
  phases: z.array(z.object({
    phaseId: z.string().uuid(),
    name: z.string(),
    progress: z.number().min(0).max(100),
    assignmentsCompleted: z.number().int().min(0),
    assignmentsTotal: z.number().int().min(0),
    status: z.enum(['not_started', 'in_progress', 'completed']),
  })),
  milestones: z.object({
    total: z.number().int().min(0),
    completed: z.number().int().min(0),
    upcoming: z.array(z.object({
      milestoneId: z.string().uuid(),
      title: z.string(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })),
  }),
  startedAt: z.string().datetime(),
  estimatedCompletionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});
export type RouteProgressResponse = z.infer<typeof RouteProgressResponseSchema>;

// ============================================================================
// Specialist Performance Analytics
// ============================================================================

/**
 * GET /analytics/v1/specialists/:specialistId/performance
 * API_CONTRACTS_MVP.md:1116-1171
 */
export const SpecialistPerformanceResponseSchema = z.object({
  specialistId: z.string().uuid(),
  period: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  workload: z.object({
    activeChildren: z.number().int().min(0),
    activeRoutes: z.number().int().min(0),
    assignmentsCreated: z.number().int().min(0),
    assignmentsCompleted: z.number().int().min(0),
  }),
  performance: z.object({
    reportReviewsCompleted: z.number().int().min(0),
    avgReviewTimeHours: z.number().min(0),
    clientFeedbackAvg: z.number().min(1).max(5).nullable(),
  }),
  trends: z.object({
    assignmentCompletionRate: z.number().min(0).max(100),
    assignmentCompletionRateTrend: z.number(),
    clientSatisfaction: z.number().min(1).max(5).nullable(),
    clientSatisfactionTrend: z.number(),
  }),
});
export type SpecialistPerformanceResponse = z.infer<typeof SpecialistPerformanceResponseSchema>;

// ============================================================================
// High-Level Dashboard Schemas
// ============================================================================

/**
 * GET /analytics/v1/dashboard/parent
 * API_CONTRACTS_MVP.md:800-826
 */
export const ParentDashboardResponseSchema = z.object({
  summary: z.object({
    activeAssignments: z.number().int().min(0),
    completedThisWeek: z.number().int().min(0),
    overdue: z.number().int().min(0),
    averageCompletionRate: z.number().min(0).max(100),
  }),
  childProgress: z.object({
    childId: z.string().uuid(),
    completionRate: z.number().min(0).max(100),
    streakDays: z.number().int().min(0),
    totalPoints: z.number().int().min(0),
  }),
  upcomingDeadlines: z.array(z.object({
    assignmentId: z.string().uuid(),
    title: z.string(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })),
});
export type ParentDashboardResponse = z.infer<typeof ParentDashboardResponseSchema>;

/**
 * GET /analytics/v1/dashboard/specialist
 * API_CONTRACTS_MVP.md:828-857
 */
export const SpecialistDashboardResponseSchema = z.object({
  summary: z.object({
    activeClients: z.number().int().min(0),
    pendingReviews: z.number().int().min(0),
    upcomingAssignments: z.number().int().min(0),
  }),
  recentReports: z.array(z.object({
    reportId: z.string().uuid(),
    childName: z.string(),
    submittedAt: z.string().datetime(),
    status: z.enum(['pending', 'reviewed']),
  })),
  performanceMetrics: z.object({
    avgResponseTimeHours: z.number().min(0),
    clientSatisfactionScore: z.number().min(1).max(5).nullable(),
  }),
});
export type SpecialistDashboardResponse = z.infer<typeof SpecialistDashboardResponseSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateChildProgressResponse(data: unknown): ChildProgressResponse {
  return ChildProgressResponseSchema.parse(data);
}

export function validateAssignmentsStatsResponse(data: unknown): AssignmentsStatsResponse {
  return AssignmentsStatsResponseSchema.parse(data);
}

export function validateGoalsProgressResponse(data: unknown): GoalsProgressResponse {
  return GoalsProgressResponseSchema.parse(data);
}

export function validateChildTimelineResponse(data: unknown): ChildTimelineResponse {
  return ChildTimelineResponseSchema.parse(data);
}

export function validateRouteProgressResponse(data: unknown): RouteProgressResponse {
  return RouteProgressResponseSchema.parse(data);
}

export function validateSpecialistPerformanceResponse(data: unknown): SpecialistPerformanceResponse {
  return SpecialistPerformanceResponseSchema.parse(data);
}
