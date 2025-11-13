/**
 * Auth Validators
 * 
 * Zod схемы для валидации входящих данных
 */

import { z } from 'zod';

/**
 * Schema для login
 */
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

/**
 * Schema для refresh
 */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token обязателен'),
});

/**
 * Schema для invite
 */
export const inviteSchema = z.object({
  email: z.string().email('Некорректный email'),
  role: z.enum(['parent', 'specialist', 'supervisor', 'admin'], {
    errorMap: () => ({ message: 'Некорректная роль' }),
  }),
  firstName: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное'),
  lastName: z.string().min(1, 'Фамилия обязательна').max(100, 'Фамилия слишком длинная'),
});

