/**
 * Exercises Routes
 * 
 * API маршруты для управления упражнениями
 */

import { Router } from 'express';
import * as exercisesController from '../controllers/exercises.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole, requireSpecialist, requireAdmin } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  createExerciseSchema,
  updateExerciseSchema,
  getExerciseByIdSchema,
  listExercisesSchema,
  publishExerciseSchema,
  deleteExerciseSchema
} from '../validators/exercises.validators';

const router = Router();

// Применение rate limiting ко всем routes
router.use(apiLimiter);

/**
 * GET /exercises/v1/categories
 * Получение списка категорий упражнений
 * Public endpoint (no auth required)
 */
router.get(
  '/categories',
  exercisesController.getCategories
);

/**
 * GET /exercises/v1
 * Получение списка упражнений с фильтрацией и пагинацией
 * Требуется аутентификация: specialist, supervisor, admin
 */
router.get(
  '/',
  authenticateToken,
  requireSpecialist,
  validateRequest(listExercisesSchema),
  exercisesController.listExercises
);

/**
 * GET /exercises/v1/:id
 * Получение упражнения по ID
 * Требуется аутентификация: specialist, supervisor, admin
 */
router.get(
  '/:id',
  authenticateToken,
  requireSpecialist,
  validateRequest(getExerciseByIdSchema),
  exercisesController.getExerciseById
);

/**
 * POST /exercises/v1
 * Создание нового упражнения
 * Требуется аутентификация: specialist, admin
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['specialist', 'admin']),
  validateRequest(createExerciseSchema),
  exercisesController.createExercise
);

/**
 * PATCH /exercises/v1/:id
 * Обновление упражнения
 * Требуется аутентификация: specialist, admin
 */
router.patch(
  '/:id',
  authenticateToken,
  requireRole(['specialist', 'admin']),
  validateRequest(updateExerciseSchema),
  exercisesController.updateExercise
);

/**
 * POST /exercises/v1/:id/publish
 * Публикация упражнения
 * Требуется аутентификация: admin
 */
router.post(
  '/:id/publish',
  authenticateToken,
  requireAdmin,
  validateRequest(publishExerciseSchema),
  exercisesController.publishExercise
);

/**
 * DELETE /exercises/v1/:id
 * Архивация упражнения (soft delete)
 * Требуется аутентификация: admin
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateRequest(deleteExerciseSchema),
  exercisesController.deleteExercise
);

export { router as exercisesRouter };


