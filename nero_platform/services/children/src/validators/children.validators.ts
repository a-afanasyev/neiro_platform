/**
 * Children Validators
 * Zod схемы для валидации детей
 */

import { z } from 'zod';

export const createChildSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  birthDate: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  diagnosisSummary: z.string().max(1000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  // Обязательное указание родителя при создании ребенка
  parentUserId: z.string().uuid('Необходимо указать родителя или опекуна'),
  relationship: z.enum(['mother', 'father', 'guardian', 'other']),
  legalGuardian: z.boolean().default(true),
});

export const updateChildSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  diagnosisSummary: z.string().max(1000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const addParentSchema = z.object({
  parentUserId: z.string().uuid(),
  relationship: z.enum(['mother', 'father', 'guardian', 'other']),
  legalGuardian: z.boolean().optional(),
});

export const updateParentSchema = z.object({
  relationship: z.enum(['mother', 'father', 'guardian', 'other']).optional(),
  legalGuardian: z.boolean().optional(),
  guardianshipType: z.string().max(100).optional().nullable(),
});

export const addSpecialistSchema = z.object({
  specialistId: z.string().uuid(),
  specialization: z.enum(['lead', 'speech', 'aba', 'occupational', 'supervisor', 'other']),
  isPrimary: z.boolean().optional(),
  roleDescription: z.string().max(500).optional().nullable(),
});

