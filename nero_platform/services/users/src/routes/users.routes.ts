/**
 * Users Routes
 * 
 * GET    /users/v1 - список пользователей (admin, supervisor)
 * GET    /users/v1/:id - получение пользователя
 * PATCH  /users/v1/:id - обновление пользователя
 * DELETE /users/v1/:id - деактивация пользователя
 * GET    /users/v1/:id/children - дети пользователя (parent)
 */

import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { updateUserSchema } from '../validators/users.validators';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

/**
 * GET /users/v1
 * Получение списка пользователей (для admin/supervisor)
 */
router.get('/', requireRole(['admin', 'supervisor']), usersController.listUsers);

/**
 * GET /users/v1/:id
 * Получение пользователя по ID
 */
router.get('/:id', usersController.getUser);

/**
 * PATCH /users/v1/:id
 * Обновление данных пользователя
 */
router.patch(
  '/:id',
  validateRequest(updateUserSchema),
  usersController.updateUser
);

/**
 * DELETE /users/v1/:id
 * Деактивация пользователя (admin only)
 */
router.delete('/:id', requireRole(['admin']), usersController.deactivateUser);

/**
 * GET /users/v1/:id/children
 * Получение детей пользователя (для родителей)
 */
router.get('/:id/children', usersController.getUserChildren);

/**
 * GET /users/v1/:id/gdpr/export
 * GDPR: Экспорт всех данных пользователя (право на портируемость данных)
 * Пользователь может запросить только свои данные
 */
router.get('/:id/gdpr/export', usersController.exportUserData);

/**
 * POST /users/v1/:id/gdpr/delete
 * GDPR: Запрос на удаление всех данных пользователя (право на забвение)
 * Пользователь может запросить удаление только своих данных
 */
router.post('/:id/gdpr/delete', usersController.requestDataDeletion);

export default router;

