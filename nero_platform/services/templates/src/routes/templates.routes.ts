/**
 * Templates Routes
 * 
 * API маршруты для управления шаблонами маршрутов
 */

import { Router } from 'express';
import * as templatesController from '../controllers/templates.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole, requireSpecialist, requireAdmin } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  createTemplateSchema,
  updateTemplateSchema,
  getTemplateByIdSchema,
  listTemplatesSchema,
  publishTemplateSchema,
  archiveTemplateSchema,
  cloneTemplateSchema
} from '../validators/templates.validators';

const router = Router();

// Применение rate limiting ко всем routes
router.use(apiLimiter);

/**
 * GET /templates/v1
 * Получение списка шаблонов с фильтрацией и пагинацией
 * Требуется аутентификация: specialist, supervisor, admin
 */
router.get(
  '/',
  authenticateToken,
  requireSpecialist,
  validateRequest(listTemplatesSchema),
  templatesController.listTemplates
);

/**
 * GET /templates/v1/:id
 * Получение шаблона по ID
 * Требуется аутентификация: specialist, supervisor, admin
 */
router.get(
  '/:id',
  authenticateToken,
  requireSpecialist,
  validateRequest(getTemplateByIdSchema),
  templatesController.getTemplateById
);

/**
 * POST /templates/v1
 * Создание нового шаблона
 * Требуется аутентификация: supervisor, admin
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['supervisor', 'admin']),
  validateRequest(createTemplateSchema),
  templatesController.createTemplate
);

/**
 * PATCH /templates/v1/:id
 * Обновление шаблона
 * Требуется аутентификация: supervisor, admin
 */
router.patch(
  '/:id',
  authenticateToken,
  requireRole(['supervisor', 'admin']),
  validateRequest(updateTemplateSchema),
  templatesController.updateTemplate
);

/**
 * POST /templates/v1/:id/publish
 * Публикация шаблона
 * Требуется аутентификация: admin
 */
router.post(
  '/:id/publish',
  authenticateToken,
  requireAdmin,
  validateRequest(publishTemplateSchema),
  templatesController.publishTemplate
);

/**
 * POST /templates/v1/:id/archive
 * Архивация шаблона
 * Требуется аутентификация: admin
 */
router.post(
  '/:id/archive',
  authenticateToken,
  requireAdmin,
  validateRequest(archiveTemplateSchema),
  templatesController.archiveTemplate
);

/**
 * POST /templates/v1/:id/clone
 * Клонирование шаблона
 * Требуется аутентификация: supervisor, admin
 */
router.post(
  '/:id/clone',
  authenticateToken,
  requireRole(['supervisor', 'admin']),
  validateRequest(cloneTemplateSchema),
  templatesController.cloneTemplate
);

export { router as templatesRouter };


