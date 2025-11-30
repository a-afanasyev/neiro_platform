import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get child statistics
router.get(
  '/children/:childId',
  statsController.getChildStats.bind(statsController)
);

// Detailed assignments statistics for child
router.get(
  '/children/:childId/assignments-stats',
  requireRole('parent', 'specialist', 'supervisor', 'admin'),
  statsController.getAssignmentsStats.bind(statsController)
);

// Goals progress for child
router.get(
  '/children/:childId/goals-progress',
  requireRole('specialist', 'supervisor', 'admin'),
  statsController.getGoalsProgress.bind(statsController)
);

// Activity timeline for child
router.get(
  '/children/:childId/timeline',
  requireRole('parent', 'specialist', 'supervisor', 'admin'),
  statsController.getTimeline.bind(statsController)
);

// Route progress overview
router.get(
  '/routes/:routeId/progress',
  requireRole('specialist', 'supervisor', 'admin'),
  statsController.getRouteProgress.bind(statsController)
);

// Get specialist statistics
router.get(
  '/specialist/:specialistId',
  requireRole('specialist', 'admin', 'supervisor'),
  statsController.getSpecialistStats.bind(statsController)
);

// Invalidate cache (admin only)
router.post(
  '/cache/invalidate',
  requireRole('admin'),
  statsController.invalidateCache.bind(statsController)
);

export default router;
