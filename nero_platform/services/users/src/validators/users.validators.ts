/**
 * Users Validators
 * 
 * Zod схемы для валидации пользователей
 */

import { z } from 'zod';

/**
 * Schema для обновления пользователя
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/).optional().nullable(),
  timezone: z.string().max(50).optional(),
  role: z.enum(['parent', 'specialist', 'supervisor', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'invited']).optional(),
});

