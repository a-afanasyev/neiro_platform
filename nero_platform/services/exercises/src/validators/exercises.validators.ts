/**
 * Exercises Validators
 * 
 * Zod схемы для валидации запросов к Exercises API
 */

import { z } from 'zod';

/**
 * Категории упражнений
 */
export const ExerciseCategoryEnum = z.enum([
  'cognitive',
  'speech',
  'motor',
  'social',
  'sensory',
  'daily'
]);

/**
 * Уровни сложности
 */
export const ExerciseDifficultyEnum = z.enum([
  'easy',
  'medium',
  'hard'
]);

/**
 * Схема для материалов упражнения (JSONB)
 */
export const MaterialSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).optional(),
  optional: z.boolean().optional()
});

/**
 * Схема для инструкций упражнения (JSONB)
 */
export const InstructionsSchema = z.object({
  steps: z.array(z.string().min(1).max(500)),
  duration_per_step: z.array(z.number().int().min(1)).optional(),
  visual_aids: z.array(z.string().url()).optional(),
  tips: z.array(z.string().max(300)).optional(),
  safety_notes: z.array(z.string().max(300)).optional()
});

/**
 * Схема для критериев успеха (JSONB)
 */
export const SuccessCriteriaSchema = z.array(
  z.string().min(1).max(500)
);

/**
 * Схема для медиа-ресурсов (JSONB)
 */
export const MediaAssetSchema = z.object({
  type: z.enum(['video', 'image', 'audio']),
  url: z.string().url(),
  description: z.string().max(300).optional(),
  duration_seconds: z.number().int().min(1).optional()
});

/**
 * Схема создания упражнения
 */
export const createExerciseSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug должен содержать только строчные буквы, цифры и дефисы'),
    description: z.string().max(2000).optional(),
    category: ExerciseCategoryEnum,
    ageMin: z.number().int().min(0).max(18),
    ageMax: z.number().int().min(0).max(18),
    difficulty: ExerciseDifficultyEnum,
    durationMinutes: z.number().int().min(1).max(180),
    materials: z.array(MaterialSchema).optional().default([]),
    instructions: InstructionsSchema,
    successCriteria: SuccessCriteriaSchema,
    mediaAssets: z.array(MediaAssetSchema).optional().default([])
  }).refine(
    (data) => data.ageMin <= data.ageMax,
    {
      message: 'ageMin должен быть меньше или равен ageMax',
      path: ['ageMin']
    }
  )
});

/**
 * Схема обновления упражнения
 */
export const updateExerciseSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().max(2000).optional().nullable(),
    category: ExerciseCategoryEnum.optional(),
    ageMin: z.number().int().min(0).max(18).optional(),
    ageMax: z.number().int().min(0).max(18).optional(),
    difficulty: ExerciseDifficultyEnum.optional(),
    durationMinutes: z.number().int().min(1).max(180).optional(),
    materials: z.array(MaterialSchema).optional(),
    instructions: InstructionsSchema.optional(),
    successCriteria: SuccessCriteriaSchema.optional(),
    mediaAssets: z.array(MediaAssetSchema).optional()
  }).refine(
    (data) => {
      if (data.ageMin !== undefined && data.ageMax !== undefined) {
        return data.ageMin <= data.ageMax;
      }
      return true;
    },
    {
      message: 'ageMin должен быть меньше или равен ageMax',
      path: ['ageMin']
    }
  ),
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  })
});

/**
 * Схема получения упражнения по ID
 */
export const getExerciseByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  })
});

/**
 * Схема фильтрации упражнений
 */
export const listExercisesSchema = z.object({
  query: z.object({
    category: ExerciseCategoryEnum.optional(),
    difficulty: ExerciseDifficultyEnum.optional(),
    ageFrom: z.coerce.number().int().min(0).max(18).optional(),
    ageTo: z.coerce.number().int().min(0).max(18).optional(),
    published: z.coerce.boolean().optional(),
    search: z.string().max(200).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    cursor: z.string().optional()
  }).refine(
    (data) => {
      if (data.ageFrom !== undefined && data.ageTo !== undefined) {
        return data.ageFrom <= data.ageTo;
      }
      return true;
    },
    {
      message: 'ageFrom должен быть меньше или равен ageTo',
      path: ['ageFrom']
    }
  )
});

/**
 * Схема публикации упражнения
 */
export const publishExerciseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  })
});

/**
 * Схема удаления (архивации) упражнения
 */
export const deleteExerciseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  })
});

/**
 * Типы для TypeScript
 */
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>['body'];
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>['body'];
export type ListExercisesQuery = z.infer<typeof listExercisesSchema>['query'];
export type ExerciseCategory = z.infer<typeof ExerciseCategoryEnum>;
export type ExerciseDifficulty = z.infer<typeof ExerciseDifficultyEnum>;


