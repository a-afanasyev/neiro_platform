/**
 * Assignments Routes
 */

import { Router } from 'express';
import * as assignmentsController from '../controllers/assignments.controller';
import { authenticateToken } from '../middleware/auth';
import { requireSpecialist } from '../middleware/rbac';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(apiLimiter);

// CRUD операции
router.get('/', authenticateToken, assignmentsController.listAssignments);
router.get('/overdue', authenticateToken, requireSpecialist, assignmentsController.getOverdue);
router.post('/mark-overdue', authenticateToken, requireSpecialist, assignmentsController.markOverdue);
router.get('/calendar', authenticateToken, assignmentsController.getCalendar);
router.get('/stats/:childId', authenticateToken, assignmentsController.getStats);

router.get('/:id', authenticateToken, assignmentsController.getAssignmentById);
router.post('/', authenticateToken, requireSpecialist, assignmentsController.createAssignment);
router.patch('/:id', authenticateToken, requireSpecialist, assignmentsController.updateAssignment);

// Управление статусом
router.patch('/:id/status', authenticateToken, assignmentsController.updateStatus);
router.post('/:id/complete', authenticateToken, assignmentsController.completeAssignment);
router.post('/:id/cancel', authenticateToken, requireSpecialist, assignmentsController.cancelAssignment);

export { router as assignmentsRouter };
