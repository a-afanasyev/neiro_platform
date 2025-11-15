/**
 * Routes Validators
 * Упрощенные Zod схемы для валидации запросов к Routes API
 */

import { z } from 'zod';

export const createRouteSchema = z.object({
  body: z.object({
    childId: z.string().uuid(),
    templateId: z.string().uuid().optional(),
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional()
  })
});

export const updateRouteSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional()
  }),
  params: z.object({ id: z.string().uuid() })
});

export const getRouteByIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const listRoutesSchema = z.object({
  query: z.object({
    childId: z.string().uuid().optional(),
    status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    cursor: z.string().optional()
  })
});

export const activateRouteSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>['body'];
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>['body'];
export type ListRoutesQuery = z.infer<typeof listRoutesSchema>['query'];

