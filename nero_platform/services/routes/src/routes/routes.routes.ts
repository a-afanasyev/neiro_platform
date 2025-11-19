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

// Goals endpoints
router.get('/:id/goals', authenticateToken, requireSpecialist, routesController.getRouteGoals);
router.post('/:id/goals', authenticateToken, requireSpecialist, routesController.createRouteGoal);
router.put('/:id/goals/:goalId', authenticateToken, requireSpecialist, routesController.updateRouteGoal);
router.delete('/:id/goals/:goalId', authenticateToken, requireSpecialist, routesController.deleteRouteGoal);

// Phases endpoints
router.get('/:id/phases', authenticateToken, requireSpecialist, routesController.getRoutePhases);
router.post('/:id/phases', authenticateToken, requireSpecialist, routesController.createRoutePhase);
router.put('/:id/phases/:phaseId', authenticateToken, requireSpecialist, routesController.updateRoutePhase);
router.delete('/:id/phases/:phaseId', authenticateToken, requireSpecialist, routesController.deleteRoutePhase);

export { router as routesRouter };


