import { PrismaClient } from '@neiro/database';
import { logger } from '../utils/logger';
import { emailService } from './email.service';
import { templateService } from './template.service';

/**
 * Delivery Notification Service
 *
 * Handles creation and delivery of notifications through various channels
 * (email, SMS, push, telegram)
 */

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface CreateDeliveryNotificationInput {
  recipientId: string;
  channel: 'email' | 'sms' | 'push' | 'telegram';
  template: string;
  payload: Record<string, any>;
  scheduledAt?: Date;
}

export class DeliveryService {
  /**
   * Create a delivery notification (queued for sending)
   */
  async createDeliveryNotification(input: CreateDeliveryNotificationInput) {
    try {
      const notification = await prisma.notification.create({
        data: {
          recipientId: input.recipientId,
          channel: input.channel,
          template: input.template,
          payload: input.payload,
          status: 'pending',
          attempts: 0,
          scheduledAt: input.scheduledAt || new Date(),
        },
      });

      logger.info('Delivery notification created', {
        notificationId: notification.id,
        recipientId: input.recipientId,
        channel: input.channel,
        template: input.template,
      });

      // If scheduled for immediate delivery, send now
      if (!input.scheduledAt || input.scheduledAt <= new Date()) {
        await this.sendNotification(notification.id);
      }

      return notification;
    } catch (error: any) {
      logger.error('Failed to create delivery notification', { error: error.message, input });
      throw error;
    }
  }

  /**
   * Send a pending notification
   */
  async sendNotification(notificationId: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.status === 'sent') {
        logger.warn('Notification already sent', { notificationId });
        return;
      }

      // Get recipient email
      const recipient = await prisma.user.findUnique({
        where: { id: notification.recipientId },
        select: { email: true, firstName: true, lastName: true },
      });

      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Send based on channel
      let success = false;
      let errorMessage: string | null = null;

      try {
        switch (notification.channel) {
          case 'email':
            success = await this.sendEmail(notification, recipient.email);
            break;
          case 'sms':
            // TODO: Implement SMS sending
            logger.warn('SMS delivery not implemented yet', { notificationId });
            errorMessage = 'SMS delivery not implemented';
            break;
          case 'push':
            // TODO: Implement push notification
            logger.warn('Push notification not implemented yet', { notificationId });
            errorMessage = 'Push notification not implemented';
            break;
          case 'telegram':
            // TODO: Implement Telegram sending
            logger.warn('Telegram delivery not implemented yet', { notificationId });
            errorMessage = 'Telegram delivery not implemented';
            break;
          default:
            throw new Error(`Unknown channel: ${notification.channel}`);
        }
      } catch (error: any) {
        success = false;
        errorMessage = error.message;
      }

      // Update notification status
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date() : null,
          attempts: notification.attempts + 1,
          lastError: errorMessage,
        },
      });

      if (success) {
        logger.info('Notification sent successfully', { notificationId, channel: notification.channel });
      } else {
        logger.error('Notification delivery failed', { notificationId, error: errorMessage });
      }
    } catch (error: any) {
      logger.error('Error sending notification', { notificationId, error: error.message });
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: any, recipientEmail: string): Promise<boolean> {
    try {
      // Render template with payload
      const html = templateService.render(notification.template, notification.payload);

      // Get subject based on template
      const subject = this.getEmailSubject(notification.template);

      // Send email
      await emailService.sendEmail({
        to: recipientEmail,
        subject,
        html,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send email', { error: error.message, template: notification.template });
      throw error;
    }
  }

  /**
   * Get email subject based on template
   */
  private getEmailSubject(template: string): string {
    const subjects: Record<string, string> = {
      assignment_reminder: 'Напоминание о задании - Neiro Platform',
      report_reviewed: 'Отчет проверен специалистом - Neiro Platform',
      new_assignment: 'Новое задание назначено - Neiro Platform',
    };

    return subjects[template] || 'Уведомление - Neiro Platform';
  }

  /**
   * Get pending notifications (scheduled for delivery)
   */
  async getPendingNotifications(limit: number = 10) {
    return prisma.notification.findMany({
      where: {
        status: 'pending',
        scheduledAt: { lte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }

  /**
   * Process pending notifications
   */
  async processPendingNotifications() {
    const pending = await this.getPendingNotifications(10);

    logger.info('Processing pending notifications', { count: pending.length });

    for (const notification of pending) {
      try {
        await this.sendNotification(notification.id);
      } catch (error: any) {
        logger.error('Error processing notification', {
          notificationId: notification.id,
          error: error.message,
        });
      }
    }
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications(maxAttempts: number = 3) {
    const failed = await prisma.notification.findMany({
      where: {
        status: 'failed',
        attempts: { lt: maxAttempts },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    logger.info('Retrying failed notifications', { count: failed.length });

    for (const notification of failed) {
      try {
        await this.sendNotification(notification.id);
      } catch (error: any) {
        logger.error('Error retrying notification', {
          notificationId: notification.id,
          error: error.message,
        });
      }
    }
  }
}

// Singleton instance
export const deliveryService = new DeliveryService();
