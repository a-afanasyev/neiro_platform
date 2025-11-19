/**
 * Children Routes
 *
 * POST   /children/v1 - создание профиля ребенка
 * GET    /children/v1 - список детей
 * GET    /children/v1/:id - получение ребенка
 * PATCH  /children/v1/:id - обновление ребенка
 * DELETE /children/v1/:id - архивация ребенка
 * POST   /children/v1/:id/parents - добавление родителя
 * DELETE /children/v1/:id/parents/:parentId - удаление родителя
 * PATCH  /children/v1/:id/parents/:parentId - обновление родителя
 * POST   /children/v1/:id/specialists - назначение специалиста
 * DELETE /children/v1/:id/specialists/:specialistId - снятие специалиста
 */

import { Router } from 'express';
import { childrenController } from '../controllers/children.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import {
  createChildSchema,
  updateChildSchema,
  addParentSchema,
  updateParentSchema,
  addSpecialistSchema,
} from '../validators/children.validators';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

/**
 * POST /children/v1
 * Создание профиля ребенка (специалист или admin)
 */
router.post(
  '/',
  requireRole(['specialist', 'supervisor', 'admin']),
  validateRequest(createChildSchema),
  childrenController.createChild
);

/**
 * GET /children/v1
 * Получение списка детей
 */
router.get('/', childrenController.listChildren);

/**
 * GET /children/v1/:id
 * Получение профиля ребенка
 */
router.get('/:id', childrenController.getChild);

/**
 * PATCH /children/v1/:id
 * Обновление профиля ребенка
 */
router.patch(
  '/:id',
  validateRequest(updateChildSchema),
  childrenController.updateChild
);

/**
 * DELETE /children/v1/:id
 * Архивация ребенка (admin only)
 */
router.delete('/:id', requireRole(['admin']), childrenController.archiveChild);

/**
 * POST /children/v1/:id/parents
 * Добавление родителя к ребенку
 */
router.post(
  '/:id/parents',
  requireRole(['specialist', 'supervisor', 'admin']),
  validateRequest(addParentSchema),
  childrenController.addParent
);

/**
 * DELETE /children/v1/:id/parents/:parentId
 * Удаление родителя от ребенка
 */
router.delete(
  '/:id/parents/:parentId',
  requireRole(['specialist', 'supervisor', 'admin']),
  childrenController.removeParent
);

/**
 * PATCH /children/v1/:id/parents/:parentId
 * Обновление информации о родителе
 */
router.patch(
  '/:id/parents/:parentId',
  requireRole(['specialist', 'supervisor', 'admin']),
  validateRequest(updateParentSchema),
  childrenController.updateParent
);

/**
 * POST /children/v1/:id/specialists
 * Назначение специалиста ребенку
 */
router.post(
  '/:id/specialists',
  requireRole(['specialist', 'supervisor', 'admin']),
  validateRequest(addSpecialistSchema),
  childrenController.assignSpecialist
);

/**
 * DELETE /children/v1/:id/specialists/:specialistId
 * Снятие специалиста с ребенка
 */
router.delete(
  '/:id/specialists/:specialistId',
  requireRole(['specialist', 'supervisor', 'admin']),
  childrenController.unassignSpecialist
);

export default router;

