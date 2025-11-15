/**
 * Global Error Handler Middleware
 * 
 * Централизованная обработка ошибок в формате RFC 7807
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

/**
 * Форматирование ошибки в RFC 7807 Problem Details
 */
function formatErrorResponse(error: any, req: Request) {
  const traceId = req.headers['x-trace-id'] || 'unknown';

  return {
    type: `https://api.neiro.dev/problems/${error.code?.toLowerCase() || 'internal-error'}`,
    title: error.name || 'Internal Server Error',
    status: error.statusCode || 500,
    detail: error.message || 'Произошла внутренняя ошибка сервера',
    instance: req.originalUrl,
    traceId,
    ...(error.errors && { errors: error.errors })
  };
}

/**
 * Middleware обработки ошибок
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Логирование ошибки
  console.error('❌ Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method
  });

  // AppError (наши кастомные ошибки)
  if (error instanceof AppError) {
    const response = formatErrorResponse(error, req);
    return res.status(error.statusCode).json(response);
  }

  // Zod Validation Errors
  if (error instanceof ZodError) {
    const validationErrors: Record<string, string[]> = {};
    
    error.errors.forEach((err) => {
      const field = err.path.join('.');
      if (!validationErrors[field]) {
        validationErrors[field] = [];
      }
      validationErrors[field].push(err.message);
    });

    const response = {
      type: 'https://api.neiro.dev/problems/validation-error',
      title: 'Validation Failed',
      status: 400,
      detail: 'Ошибка валидации входных данных',
      instance: req.originalUrl,
      errors: validationErrors,
      traceId: req.headers['x-trace-id'] || 'unknown'
    };

    return res.status(400).json(response);
  }

  // Prisma Errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    if (prismaError.code === 'P2002') {
      const response = {
        type: 'https://api.neiro.dev/problems/duplicate-entry',
        title: 'Duplicate Entry',
        status: 409,
        detail: 'Запись с такими данными уже существует',
        instance: req.originalUrl,
        traceId: req.headers['x-trace-id'] || 'unknown'
      };
      return res.status(409).json(response);
    }

    if (prismaError.code === 'P2025') {
      const response = {
        type: 'https://api.neiro.dev/problems/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Запрашиваемая запись не найдена',
        instance: req.originalUrl,
        traceId: req.headers['x-trace-id'] || 'unknown'
      };
      return res.status(404).json(response);
    }
  }

  // Generic Server Error
  const response = {
    type: 'https://api.neiro.dev/problems/internal-error',
    title: 'Internal Server Error',
    status: 500,
    detail: process.env.NODE_ENV === 'production' 
      ? 'Произошла внутренняя ошибка сервера' 
      : error.message,
    instance: req.originalUrl,
    traceId: req.headers['x-trace-id'] || 'unknown',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  };

  res.status(500).json(response);
}

