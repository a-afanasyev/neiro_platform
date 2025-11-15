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
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug должен содержать только строчные буквы, цифры и дефисы'),
    description: z.string().max(2000).optional(),
    ageMin: z.number().int().min(0).max(18).optional(),
    ageMax: z.number().int().min(0).max(18).optional(),
    durationWeeks: z.number().int().min(1).max(104).optional(),
    phases: z.array(z.object({
      name: z.string().min(1).max(255),
      orderIndex: z.number().int().min(0),
      durationWeeks: z.number().int().min(1).max(52),
      description: z.string().max(1000).optional(),
      parallelGroup: z.number().int().min(0).optional()
    })).optional(),
    goals: z.array(z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      category: z.string().max(100)
    })).optional()
  })
});

/**
 * Схема обновления шаблона
 */
export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().max(2000).optional().nullable(),
    ageMin: z.number().int().min(0).max(18).optional(),
    ageMax: z.number().int().min(0).max(18).optional(),
    durationWeeks: z.number().int().min(1).max(104).optional()
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
    published: z.coerce.boolean().optional(),
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
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/)
  })
});

/**
 * Типы для TypeScript
 */
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>['body'];
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>['body'];
export type ListTemplatesQuery = z.infer<typeof listTemplatesSchema>['query'];
export type CloneTemplateInput = z.infer<typeof cloneTemplateSchema>['body'];


