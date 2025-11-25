import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const reportController = new ReportController();

// All routes require authentication
router.use(authenticate);

// Create report (parents only)
router.post(
  '/',
  requireRole('parent'),
  reportController.createReport.bind(reportController)
);

// List reports (filtered by role)
router.get(
  '/',
  reportController.getReports.bind(reportController)
);

// Get specific report
router.get(
  '/:id',
  reportController.getReportById.bind(reportController)
);

// Review report (specialists only)
router.post(
  '/:id/review',
  requireRole('specialist', 'supervisor'),
  reportController.reviewReport.bind(reportController)
);

// Delete report (parents only, within 24 hours)
router.delete(
  '/:id',
  requireRole('parent'),
  reportController.deleteReport.bind(reportController)
);

export default router;
