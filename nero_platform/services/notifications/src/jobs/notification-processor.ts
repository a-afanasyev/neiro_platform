import cron from 'node-cron';
import { deliveryService } from '../services/delivery.service';
import { userNotificationService } from '../services/user-notification.service';
import { logger } from '../utils/logger';

/**
 * Notification Processor Cron Jobs
 *
 * Automatically process pending notifications and cleanup old data
 */

export class NotificationProcessor {
  private pendingNotificationsJob: cron.ScheduledTask | null = null;
  private retryFailedJob: cron.ScheduledTask | null = null;
  private cleanupJob: cron.ScheduledTask | null = null;

  /**
   * Start all cron jobs
   */
  start() {
    this.startPendingNotificationsProcessor();
    this.startFailedNotificationsRetry();
    this.startCleanupJob();

    logger.info('Notification processor cron jobs started');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    if (this.pendingNotificationsJob) {
      this.pendingNotificationsJob.stop();
    }
    if (this.retryFailedJob) {
      this.retryFailedJob.stop();
    }
    if (this.cleanupJob) {
      this.cleanupJob.stop();
    }

    logger.info('Notification processor cron jobs stopped');
  }

  /**
   * Process pending notifications every minute
   */
  private startPendingNotificationsProcessor() {
    // Run every minute
    this.pendingNotificationsJob = cron.schedule('* * * * *', async () => {
      try {
        logger.debug('Processing pending notifications (cron job)');
        await deliveryService.processPendingNotifications();
      } catch (error: any) {
        logger.error('Error in pending notifications cron job', { error: error.message });
      }
    });

    logger.info('Pending notifications processor started (runs every minute)');
  }

  /**
   * Retry failed notifications every 5 minutes
   */
  private startFailedNotificationsRetry() {
    // Run every 5 minutes
    this.retryFailedJob = cron.schedule('*/5 * * * *', async () => {
      try {
        logger.debug('Retrying failed notifications (cron job)');
        await deliveryService.retryFailedNotifications(3);
      } catch (error: any) {
        logger.error('Error in retry failed notifications cron job', { error: error.message });
      }
    });

    logger.info('Failed notifications retry started (runs every 5 minutes)');
  }

  /**
   * Cleanup old notifications daily at 3 AM
   */
  private startCleanupJob() {
    // Run daily at 3:00 AM
    this.cleanupJob = cron.schedule('0 3 * * *', async () => {
      try {
        logger.debug('Cleaning up old notifications (cron job)');
        const count = await userNotificationService.cleanupOldNotifications(30);
        logger.info('Old notifications cleaned up', { count });
      } catch (error: any) {
        logger.error('Error in cleanup notifications cron job', { error: error.message });
      }
    });

    logger.info('Cleanup job started (runs daily at 3:00 AM)');
  }
}

// Singleton instance
export const notificationProcessor = new NotificationProcessor();
