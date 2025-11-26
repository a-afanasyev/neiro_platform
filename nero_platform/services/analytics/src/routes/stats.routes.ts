import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get child statistics
router.get(
  '/child/:childId',
  statsController.getChildStats.bind(statsController)
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
