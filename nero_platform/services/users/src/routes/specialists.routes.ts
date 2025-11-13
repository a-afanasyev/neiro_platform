/**
 * Specialists Routes
 * 
 * GET    /users/v1/specialists - список специалистов
 * GET    /users/v1/specialists/:id - профиль специалиста
 * PATCH  /users/v1/specialists/:id - обновление профиля
 * GET    /users/v1/specialists/:id/children - дети специалиста
 */

import { Router } from 'express';
import { specialistsController } from '../controllers/specialists.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { updateSpecialistSchema } from '../validators/specialists.validators';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

/**
 * GET /users/v1/specialists
 * Получение списка специалистов
 */
router.get('/', specialistsController.listSpecialists);

/**
 * GET /users/v1/specialists/:id
 * Получение профиля специалиста
 */
router.get('/:id', specialistsController.getSpecialist);

/**
 * PATCH /users/v1/specialists/:id
 * Обновление профиля специалиста (сам специалист или admin)
 */
router.patch(
  '/:id',
  validateRequest(updateSpecialistSchema),
  specialistsController.updateSpecialist
);

/**
 * GET /users/v1/specialists/:id/children
 * Получение детей, с которыми работает специалист
 */
router.get('/:id/children', specialistsController.getSpecialistChildren);

export default router;

