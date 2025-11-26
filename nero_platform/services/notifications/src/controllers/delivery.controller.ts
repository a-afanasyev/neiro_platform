import { Request, Response } from 'express';
import { deliveryService } from '../services/delivery.service';
import { logger } from '../utils/logger';
import { ValidationError } from '../middleware/errorHandler';

/**
 * Delivery Notifications Controller
 *
 * Handles delivery tracking API (email/SMS/push)
 * Internal use only - called by other services
 */

/**
 * Create delivery notification
 * POST /notifications/v1/delivery
 */
export const createDeliveryNotification = async (req: Request, res: Response) => {
  try {
    const { recipientId, channel, template, payload, scheduledAt } = req.body;

    // Validation
    if (!recipientId || !channel || !template || !payload) {
      throw new ValidationError('Missing required fields: recipientId, channel, template, payload');
    }

    if (!['email', 'sms', 'push', 'telegram'].includes(channel)) {
      throw new ValidationError('Invalid channel. Must be: email, sms, push, or telegram');
    }

    // Create notification
    const notification = await deliveryService.createDeliveryNotification({
      recipientId,
      channel,
      template,
      payload,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    logger.error('Error creating delivery notification', { error: error.message });
    throw error;
  }
};

/**
 * Get pending notifications
 * GET /notifications/v1/delivery/pending
 */
export const getPendingNotifications = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const notifications = await deliveryService.getPendingNotifications(limit);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    logger.error('Error getting pending notifications', { error: error.message });
    throw error;
  }
};

/**
 * Process pending notifications manually
 * POST /notifications/v1/delivery/process
 */
export const processPendingNotifications = async (req: Request, res: Response) => {
  try {
    await deliveryService.processPendingNotifications();

    res.json({
      success: true,
      message: 'Pending notifications processed',
    });
  } catch (error: any) {
    logger.error('Error processing pending notifications', { error: error.message });
    throw error;
  }
};

/**
 * Retry failed notifications
 * POST /notifications/v1/delivery/retry
 */
export const retryFailedNotifications = async (req: Request, res: Response) => {
  try {
    const maxAttempts = parseInt(req.query.maxAttempts as string) || 3;

    await deliveryService.retryFailedNotifications(maxAttempts);

    res.json({
      success: true,
      message: 'Failed notifications retried',
    });
  } catch (error: any) {
    logger.error('Error retrying failed notifications', { error: error.message });
    throw error;
  }
};
