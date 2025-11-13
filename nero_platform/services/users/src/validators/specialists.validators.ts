/**
 * Specialists Validators
 * 
 * Zod схемы для валидации специалистов
 */

import { z } from 'zod';

/**
 * Schema для обновления специалиста
 */
export const updateSpecialistSchema = z.object({
  specialty: z
    .enum(['neuropsychologist', 'speech_therapist', 'aba', 'occupational', 'supervisor', 'other'])
    .optional(),
  licenseNumber: z.string().max(100).optional().nullable(),
  licenseValidUntil: z.string().datetime().optional().nullable(),
  experienceYears: z.number().int().min(0).max(50).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
});

