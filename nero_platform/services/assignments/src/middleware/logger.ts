/**
 * Request Logger Middleware
 * 
 * Логирование HTTP запросов
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для логирования запросов
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Логирование после завершения ответа
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };

    // Цвет в зависимости от статуса
    const statusColor = res.statusCode >= 500 ? '🔴' :
                       res.statusCode >= 400 ? '🟡' :
                       res.statusCode >= 300 ? '🔵' : '🟢';

    console.log(
      `${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

