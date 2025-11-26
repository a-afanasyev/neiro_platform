import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  createDeliveryNotification,
  getPendingNotifications,
  processPendingNotifications,
  retryFailedNotifications,
} from '../controllers/delivery.controller';

const router = Router();

/**
 * Delivery Tracking Routes
 * Internal use only - for service-to-service communication
 */

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /notifications/v1/delivery
 * @desc    Create delivery notification (email/SMS/push)
 * @access  Internal (service-to-service)
 */
router.post('/', createDeliveryNotification);

/**
 * @route   GET /notifications/v1/delivery/pending
 * @desc    Get pending notifications
 * @access  Admin only
 */
router.get('/pending', requireRole('admin'), getPendingNotifications);

/**
 * @route   POST /notifications/v1/delivery/process
 * @desc    Process pending notifications manually
 * @access  Admin only
 */
router.post('/process', requireRole('admin'), processPendingNotifications);

/**
 * @route   POST /notifications/v1/delivery/retry
 * @desc    Retry failed notifications
 * @access  Admin only
 */
router.post('/retry', requireRole('admin'), retryFailedNotifications);

export default router;
