/**
 * Templates Validators
 *
 * Zod схемы для валидации запросов к Templates API
 */

import { z } from 'zod';

/**
 * Схема создания шаблона
 */
export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    targetAgeRange: z.string().max(50).optional(),
    severityLevel: z.string().max(50).optional(),
    phases: z.array(z.object({
      name: z.string().min(1).max(255),
      orderIndex: z.number().int().min(0),
      durationWeeks: z.number().int().min(1).max(52).optional(),
      description: z.string().max(1000).optional(),
      specialtyHint: z.string().max(100).optional(),
      notes: z.string().optional()
    })).optional(),
    goals: z.array(z.object({
      description: z.string().min(1).max(1000),
      category: z.string().max(100),
      goalType: z.enum(['skill', 'behaviour', 'academic', 'other']).optional(),
      targetMetric: z.string().max(100).optional(),
      measurementUnit: z.string().max(50).optional(),
      baselineGuideline: z.string().optional(),
      targetGuideline: z.string().optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      notes: z.string().optional()
    })).optional()
  })
});

/**
 * Схема обновления шаблона
 */
export const updateTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    targetAgeRange: z.string().max(50).optional(),
    severityLevel: z.string().max(50).optional()
  }),
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  })
});

/**
 * Схема получения шаблона по ID
 */
export const getTemplateByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  })
});

/**
 * Схема фильтрации шаблонов
 */
export const listTemplatesSchema = z.object({
  query: z.object({
    status: z.enum(['draft', 'published', 'archived']).optional(),
    search: z.string().max(200).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    cursor: z.string().optional()
  })
});

/**
 * Схема публикации шаблона
 */
export const publishTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  })
});

/**
 * Схема архивации шаблона
 */
export const archiveTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  })
});

/**
 * Схема клонирования шаблона
 */
export const cloneTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Некорректный UUID')
  }),
  body: z.object({
    title: z.string().min(1).max(255)
  })
});

/**
 * Типы для TypeScript
 */
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>['body'];
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>['body'];
export type ListTemplatesQuery = z.infer<typeof listTemplatesSchema>['query'];
export type CloneTemplateInput = z.infer<typeof cloneTemplateSchema>['body'];

