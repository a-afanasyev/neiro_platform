/**
 * Константы платформы
 */

/**
 * JWT конфигурация
 */
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  BCRYPT_ROUNDS: 12,
} as const;

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  AUTH_WINDOW_MS: 60000, // 1 минута
  AUTH_MAX_REQUESTS: 5,
  API_WINDOW_MS: 60000,
  API_MAX_REQUESTS: 100,
  UPLOAD_MAX_FILES_PER_HOUR: 10,
} as const;

/**
 * Пагинация
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Файлы
 */
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB
  ALLOWED_MIME_TYPES: {
    images: ['image/jpeg', 'image/png', 'image/webp'],
    videos: ['video/mp4', 'video/webm'],
    audio: ['audio/mp3', 'audio/wav'],
    documents: ['application/pdf'],
  },
} as const;

/**
 * Роли и права
 */
export const ROLES = {
  PARENT: 'parent',
  SPECIALIST: 'specialist',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
} as const;

/**
 * Временные зоны по умолчанию
 */
export const DEFAULT_TIMEZONES = {
  TASHKENT: 'Asia/Tashkent',
  MOSCOW: 'Europe/Moscow',
  UTC: 'UTC',
} as const;

/**
 * API версионирование
 */
export const API_VERSIONS = {
  V1: 'v1',
} as const;

/**
 * События
 */
export const EVENTS = {
  // Auth
  AUTH_USER_INVITED: 'auth.user.invited',
  AUTH_USER_ACTIVATED: 'auth.user.activated',
  AUTH_USER_ROLE_CHANGED: 'auth.user.role_changed',
  AUTH_USER_SUSPENDED: 'auth.user.suspended',
  
  // Diagnostics
  DIAGNOSTICS_SESSION_STARTED: 'diagnostics.session.started',
  DIAGNOSTICS_SESSION_COMPLETED: 'diagnostics.session.completed',
  DIAGNOSTICS_SESSION_CANCELLED: 'diagnostics.session.cancelled',
  DIAGNOSTICS_RECOMMENDATIONS_GENERATED: 'diagnostics.recommendations.generated',
  
  // Routes
  ROUTES_ROUTE_CREATED: 'routes.route.created',
  ROUTES_ROUTE_ACTIVATED: 'routes.route.activated',
  ROUTES_ROUTE_UPDATED: 'routes.route.updated',
  ROUTES_ROUTE_COMPLETED: 'routes.route.completed',
  
  // Assignments
  ASSIGNMENTS_ASSIGNMENT_CREATED: 'assignments.assignment.created',
  ASSIGNMENTS_ASSIGNMENT_STATUS_CHANGED: 'assignments.assignment.status_changed',
  ASSIGNMENTS_ASSIGNMENT_OVERDUE: 'assignments.assignment.overdue',
  ASSIGNMENTS_ASSIGNMENT_CANCELLED: 'assignments.assignment.cancelled',
  
  // Reports
  REPORTS_REPORT_SUBMITTED: 'reports.report.submitted',
  REPORTS_REPORT_REVIEWED: 'reports.report.reviewed',
  REPORTS_MEDIA_ATTACHED: 'reports.media.attached',
} as const;

