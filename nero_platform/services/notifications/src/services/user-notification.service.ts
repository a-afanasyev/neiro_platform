import { PrismaClient } from '@neiro/database';
import { logger } from '../utils/logger';

/**
 * User Notification Service
 *
 * Handles in-app notifications for user interface
 * Separate from delivery tracking (email/SMS/push)
 */

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface CreateUserNotificationInput {
  userId: string;
  type: 'assignment_reminder' | 'assignment_overdue' | 'report_submitted' | 'report_reviewed' | 'goal_achieved' | 'route_updated' | 'route_completed' | 'system_message' | 'account_update';
  title: string;
  body: string;
  link?: string; // URL for navigation
  notificationId?: string; // Optional link to delivery notification
}

export class UserNotificationService {
  /**
   * Create user notification (for in-app display)
   */
  async createUserNotification(input: CreateUserNotificationInput) {
    try {
      const notification = await prisma.userNotification.create({
        data: {
          userId: input.userId,
          notificationId: input.notificationId,
          type: input.type,
          title: input.title,
          body: input.body,
          link: input.link,
          status: 'unread', // Changed from isRead: false
        },
      });

      logger.info('User notification created', {
        notificationId: notification.id,
        userId: input.userId,
        type: input.type,
      });

      return notification;
    } catch (error: any) {
      logger.error('Failed to create user notification', { error: error.message, input });
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId: string, options?: { limit?: number; offset?: number; unreadOnly?: boolean }) {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const unreadOnly = options?.unreadOnly || false;

    const where: any = { userId };
    if (unreadOnly) {
      where.status = 'unread'; // Changed from isRead: false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.userNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userNotification.count({ where }),
      prisma.userNotification.count({ where: { userId, status: 'unread' } }), // Changed from isRead: false
    ]);

    return {
      notifications,
      total,
      unreadCount,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.userNotification.findFirst({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      await prisma.userNotification.update({
        where: { id: notificationId },
        data: {
          status: 'read', // Changed from isRead: true
          readAt: new Date(),
        },
      });

      logger.info('Notification marked as read', { notificationId, userId });

      return true;
    } catch (error: any) {
      logger.error('Failed to mark notification as read', { error: error.message, notificationId });
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.userNotification.updateMany({
        where: {
          userId,
          status: 'unread', // Changed from isRead: false
        },
        data: {
          status: 'read', // Changed from isRead: true
          readAt: new Date(),
        },
      });

      logger.info('All notifications marked as read', { userId, count: result.count });

      return result.count;
    } catch (error: any) {
      logger.error('Failed to mark all notifications as read', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.userNotification.findFirst({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      await prisma.userNotification.delete({
        where: { id: notificationId },
      });

      logger.info('Notification deleted', { notificationId, userId });

      return true;
    } catch (error: any) {
      logger.error('Failed to delete notification', { error: error.message, notificationId });
      throw error;
    }
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.userNotification.count({
      where: {
        userId,
        status: 'unread', // Changed from isRead: false
      },
    });
  }

  /**
   * Clean up old read notifications (older than 30 days)
   */
  async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.userNotification.deleteMany({
      where: {
        status: 'read', // Changed from isRead: true
        readAt: { lt: cutoffDate },
      },
    });

    logger.info('Old notifications cleaned up', { count: result.count, daysOld });

    return result.count;
  }
}

// Singleton instance
export const userNotificationService = new UserNotificationService();
