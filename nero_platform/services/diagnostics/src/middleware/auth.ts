/**
 * Authentication Middleware
 * 
 * Проверка JWT токенов в запросах
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware для проверки access токена
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Токен не предоставлен', 401, 'TOKEN_MISSING');
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET не настроен');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Добавление информации о пользователе в request
    (req as any).user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Недействительный токен', 401, 'INVALID_TOKEN'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Токен истёк', 401, 'TOKEN_EXPIRED'));
    }
    next(error);
  }
}

