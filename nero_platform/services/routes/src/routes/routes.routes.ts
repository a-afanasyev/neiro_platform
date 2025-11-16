/**
 * Routes Routes
 */

import { Router } from 'express';
import * as routesController from '../controllers/routes.controller';
import { authenticateToken } from '../middleware/auth';
import { requireSpecialist } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  createRouteSchema,
  updateRouteSchema,
  getRouteByIdSchema,
  listRoutesSchema,
  activateRouteSchema
} from '../validators/routes.validators';

const router = Router();

router.use(apiLimiter);

router.get('/', authenticateToken, requireSpecialist, validateRequest(listRoutesSchema), routesController.listRoutes);
router.get('/:id', authenticateToken, requireSpecialist, validateRequest(getRouteByIdSchema), routesController.getRouteById);
router.get('/:id/history', authenticateToken, requireSpecialist, validateRequest(getRouteByIdSchema), routesController.getRouteHistory);
router.post('/', authenticateToken, requireSpecialist, validateRequest(createRouteSchema), routesController.createRoute);
router.patch('/:id', authenticateToken, requireSpecialist, validateRequest(updateRouteSchema), routesController.updateRoute);
router.post('/:id/activate', authenticateToken, requireSpecialist, validateRequest(activateRouteSchema), routesController.activateRoute);
router.post('/:id/complete', authenticateToken, requireSpecialist, validateRequest(activateRouteSchema), routesController.completeRoute);

export { router as routesRouter };


