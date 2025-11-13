/**
 * Rate Limiter Middleware
 * 
 * Ограничение количества запросов для защиты от брутфорса
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '@neiro/utils';

/**
 * Rate limiter для эндпоинтов аутентификации
 * 5 запросов в минуту на IP
 */
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH_WINDOW_MS,
  max: RATE_LIMITS.AUTH_MAX_REQUESTS,
  message: {
    type: 'https://api.neiro.dev/errors/RATE_LIMIT_EXCEEDED',
    title: 'Превышен лимит запросов',
    status: 429,
    detail: 'Слишком много попыток входа. Попробуйте позже.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter для общих API запросов
 * 100 запросов в минуту на IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.API_WINDOW_MS,
  max: RATE_LIMITS.API_MAX_REQUESTS,
  message: {
    type: 'https://api.neiro.dev/errors/RATE_LIMIT_EXCEEDED',
    title: 'Превышен лимит запросов',
    status: 429,
    detail: 'Слишком много запросов. Попробуйте позже.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

