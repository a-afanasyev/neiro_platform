/**
 * Rate Limiting Middleware
 * 
 * Ограничение количества запросов от одного IP
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter для API запросов
 * 100 запросов в минуту на IP
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 100, // максимум 100 запросов
  message: {
    type: 'https://api.neiro.dev/problems/rate-limit',
    title: 'Rate Limit Exceeded',
    status: 429,
    detail: 'Слишком много запросов. Пожалуйста, попробуйте позже.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Пропуск OPTIONS запросов (CORS preflight)
  skip: (req) => req.method === 'OPTIONS'
});

