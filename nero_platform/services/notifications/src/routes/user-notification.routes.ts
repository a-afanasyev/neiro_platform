import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createUserNotification,
} from '../controllers/user-notification.controller';

const router = Router();

/**
 * User Notifications Routes
 * For in-app notifications UI
 */

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /notifications/v1/user
 * @desc    Get user's notifications with pagination
 * @access  Authenticated users
 * @query   limit, offset, unreadOnly
 */
router.get('/', getUserNotifications);

/**
 * @route   GET /notifications/v1/user/unread-count
 * @desc    Get unread notifications count
 * @access  Authenticated users
 */
router.get('/unread-count', getUnreadCount);

/**
 * @route   POST /notifications/v1/user/read-all
 * @desc    Mark all notifications as read
 * @access  Authenticated users
 */
router.post('/read-all', markAllAsRead);

/**
 * @route   POST /notifications/v1/user/:id/read
 * @desc    Mark specific notification as read
 * @access  Authenticated users
 */
router.post('/:id/read', markAsRead);

/**
 * @route   DELETE /notifications/v1/user/:id
 * @desc    Delete notification
 * @access  Authenticated users
 */
router.delete('/:id', deleteNotification);

/**
 * @route   POST /notifications/v1/user/create
 * @desc    Create user notification (internal use)
 * @access  Authenticated services
 */
router.post('/create', createUserNotification);

export default router;
