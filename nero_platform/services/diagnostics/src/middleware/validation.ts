/**
 * Validation Middleware
 * 
 * Валидация входящих данных с помощью Zod
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Middleware для валидации запроса
 */
export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Валидация всего запроса (body, params, query)
      const validated = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      
      // Обновляем request с провалидированными данными
      req.body = validated.body || req.body;
      req.params = validated.params || req.params;
      req.query = validated.query || req.query;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return next(
          new AppError('Ошибка валидации данных', 422, 'VALIDATION_ERROR', { errors })
        );
      }
      next(error);
    }
  };
}

