import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { generateChildReportPDF, generateSpecialistReportPDF } from '../controllers/pdf.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * PDF Generation Routes
 * All routes require authentication
 */

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /analytics/v1/pdf/child/:childId
 * @desc    Generate PDF report for child progress
 * @access  Parent (own child), Specialist (assigned child), Admin, Supervisor
 * @query   days - Number of days to include (default: 30)
 */
router.get(
  '/child/:childId',
  asyncHandler(generateChildReportPDF)
);

/**
 * @route   GET /analytics/v1/pdf/specialist/:specialistId
 * @desc    Generate PDF analytics report for specialist
 * @access  Specialist (own), Admin, Supervisor
 */
router.get(
  '/specialist/:specialistId',
  requireRole('specialist', 'admin', 'supervisor'),
  asyncHandler(generateSpecialistReportPDF)
);

export default router;
