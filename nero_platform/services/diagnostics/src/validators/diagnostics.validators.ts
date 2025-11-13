import { z } from 'zod';

/**
 * Валидатор для создания диагностической сессии
 */
export const createSessionSchema = z.object({
  body: z.object({
    childId: z.string().uuid('Invalid child ID format'),
    questionnaireCode: z.enum([
      'CARS',
      'ABC',
      'ATEC',
      'VINELAND_3',
      'SPM_2',
      'M_CHAT_R'
    ], {
      errorMap: () => ({ message: 'Invalid questionnaire code' })
    }),
    notes: z.string().max(2000).optional()
  })
});

/**
 * Валидатор для обновления диагностической сессии
 */
export const updateSessionSchema = z.object({
  body: z.object({
    notes: z.string().max(2000).optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
  })
});

/**
 * Валидатор для сохранения ответов
 */
export const saveResponsesSchema = z.object({
  body: z.object({
    responses: z.record(z.any(), {
      errorMap: () => ({ message: 'Responses must be an object with question IDs as keys' })
    })
  })
});

