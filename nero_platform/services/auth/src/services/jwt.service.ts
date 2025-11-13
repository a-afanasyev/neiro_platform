/**
 * JWT Service
 * 
 * Генерация и верификация JWT токенов
 */

import jwt from 'jsonwebtoken';
import { User } from '@neiro/database';
import { JWT_CONFIG } from '@neiro/utils';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Генерация access токена (15 минут)
 */
export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET не настроен');
  }

  return jwt.sign(payload, secret, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
  });
}

/**
 * Генерация refresh токена (30 дней)
 */
export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET не настроен');
  }

  return jwt.sign(payload, secret, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
  });
}

/**
 * Верификация refresh токена
 */
export function verifyRefreshToken(token: string): TokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET не настроен');
  }

  return jwt.verify(token, secret) as TokenPayload;
}

