import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userNotificationService } from '../services/user-notification.service';
import { logger } from '../utils/logger';
import { ValidationError } from '../middleware/errorHandler';

/**
 * User Notifications Controller
 *
 * Handles in-app notifications for UI
 */

/**
 * Get user notifications
 * GET /notifications/v1/user
 */
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await userNotificationService.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly,
    });

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        unreadCount: result.unreadCount,
        hasMore: result.hasMore,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    logger.error('Error getting user notifications', { error: error.message, userId: req.user?.userId });
    throw error;
  }
};

/**
 * Get unread count
 * GET /notifications/v1/user/unread-count
 */
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const count = await userNotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    logger.error('Error getting unread count', { error: error.message, userId: req.user?.userId });
    throw error;
  }
};

/**
 * Mark notification as read
 * POST /notifications/v1/user/:id/read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id;

    if (!notificationId) {
      throw new ValidationError('Notification ID is required');
    }

    await userNotificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    logger.error('Error marking notification as read', {
      error: error.message,
      userId: req.user?.userId,
      notificationId: req.params.id,
    });
    throw error;
  }
};

/**
 * Mark all notifications as read
 * POST /notifications/v1/user/read-all
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const count = await userNotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { count },
    });
  } catch (error: any) {
    logger.error('Error marking all notifications as read', {
      error: error.message,
      userId: req.user?.userId,
    });
    throw error;
  }
};

/**
 * Delete notification
 * DELETE /notifications/v1/user/:id
 */
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id;

    if (!notificationId) {
      throw new ValidationError('Notification ID is required');
    }

    await userNotificationService.deleteNotification(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error: any) {
    logger.error('Error deleting notification', {
      error: error.message,
      userId: req.user?.userId,
      notificationId: req.params.id,
    });
    throw error;
  }
};

/**
 * Create user notification (internal use)
 * POST /notifications/v1/user/create
 */
export const createUserNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, type, title, body, link, notificationId } = req.body;

    // Validation
    if (!userId || !type || !title || !body) {
      throw new ValidationError('Missing required fields: userId, type, title, body');
    }

    const validTypes = [
      'assignment_reminder',
      'assignment_overdue',
      'report_submitted',
      'report_reviewed',
      'goal_achieved',
      'route_updated',
      'route_completed',
      'system_message',
      'account_update',
    ];

    if (!validTypes.includes(type)) {
      throw new ValidationError(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    const notification = await userNotificationService.createUserNotification({
      userId,
      type,
      title,
      body,
      link,
      notificationId,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    logger.error('Error creating user notification', { error: error.message });
    throw error;
  }
};
