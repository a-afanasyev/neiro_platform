/**
 * Типы для API (запросы, ответы, ошибки)
 */

/**
 * RFC 7807 Problem Details
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

/**
 * Cursor-based пагинация
 */
export interface PaginatedRequest {
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

/**
 * Стандартный ответ API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ProblemDetails;
}

/**
 * Статус коды HTTP
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

