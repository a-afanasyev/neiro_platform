/**
 * EventOutbox Consumer для Notifications Service
 *
 * Обрабатывает события из EventOutbox и создает уведомления
 * согласно MONTH_3_PLAN.md Task 3.1.4
 */

import { PrismaClient, EventOutbox } from '@neiro/database';
import { userNotificationService } from '../services/user-notification.service';
import { deliveryService } from '../services/delivery.service';
import { preferencesService } from '../services/preferences.service';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// ============================================================
// Configuration
// ============================================================

const CONFIG = {
  POLL_INTERVAL_MS: 10_000,      // 10 seconds
  BATCH_SIZE: 100,                // Max events per poll
  MAX_RETRY_ATTEMPTS: 3,          // Max retries before DLQ
  RETRY_DELAY_MS: 5_000,          // 5 seconds between retries
  PROCESSING_TIMEOUT_MS: 30_000,  // 30 seconds per event
};

// ============================================================
// Types
// ============================================================

interface EventPayload {
  [key: string]: any;
  actor_id?: string;
  timestamp?: string;
  correlation_id?: string;
}

interface EventHandler {
  (payload: EventPayload, event: EventOutbox): Promise<void>;
}

// ============================================================
// Event Consumer Class
// ============================================================

export class EventConsumer {
  private handlers: Map<string, EventHandler> = new Map();
  private isRunning: boolean = false;
  private pollTimer?: NodeJS.Timeout;

  constructor() {
    this.registerHandlers();
  }

  /**
   * Register all event handlers
   */
  private registerHandlers(): void {
    // Reports domain events
    this.handlers.set('reports.report.submitted', this.handleReportSubmitted.bind(this));
    this.handlers.set('reports.report.reviewed', this.handleReportReviewed.bind(this));

    // Assignments domain events
    this.handlers.set('assignments.assignment.created', this.handleAssignmentCreated.bind(this));
    this.handlers.set('assignments.assignment.status_changed', this.handleAssignmentStatusChanged.bind(this));
    this.handlers.set('assignments.assignment.overdue', this.handleAssignmentOverdue.bind(this));
  }

  /**
   * Start consuming events from EventOutbox
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Consumer already running');
      return;
    }

    this.isRunning = true;
    logger.info('EventConsumer started', {
      pollInterval: CONFIG.POLL_INTERVAL_MS,
      batchSize: CONFIG.BATCH_SIZE,
      handlersCount: this.handlers.size,
    });

    // Start polling loop
    await this.poll();
  }

  /**
   * Stop consuming events
   */
  public stop(): void {
    this.isRunning = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }
    logger.info('EventConsumer stopped');
  }

  /**
   * Poll EventOutbox for pending events
   */
  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.consumeBatch();
      } catch (error: any) {
        logger.error('Error in poll loop', { error: error.message });
      }

      // Wait before next poll
      await new Promise(resolve =>
        this.pollTimer = setTimeout(resolve, CONFIG.POLL_INTERVAL_MS)
      );
    }
  }

  /**
   * Consume a batch of events
   */
  private async consumeBatch(): Promise<void> {
    const events = await prisma.eventOutbox.findMany({
      where: {
        status: 'pending',
      },
      take: CONFIG.BATCH_SIZE,
      orderBy: { createdAt: 'asc' },
    });

    if (events.length === 0) {
      return; // No events to process
    }

    logger.debug(`Processing ${events.length} events`);

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  /**
   * Process a single event with retry logic
   */
  private async processEvent(event: EventOutbox): Promise<void> {
    const handler = this.handlers.get(event.eventName);

    if (!handler) {
      logger.warn(`No handler registered for event: ${event.eventName}`);
      await this.markAsPublished(event.id);
      return;
    }

    try {
      // Execute handler with timeout
      await this.executeWithTimeout(
        handler(event.payload as EventPayload, event),
        CONFIG.PROCESSING_TIMEOUT_MS
      );

      // Mark as successfully published
      await this.markAsPublished(event.id);
      logger.info(`Event processed: ${event.eventName}`, { eventId: event.id });

    } catch (error: any) {
      logger.error(`Error processing event ${event.id}`, { error: error.message });

      // Check retry attempts
      const retryCount = (event.payload as any).retry_count || 0;

      if (retryCount >= CONFIG.MAX_RETRY_ATTEMPTS) {
        // Move to Dead Letter Queue
        await this.moveToDLQ(event, error.message);
      } else {
        // Retry: increment counter and keep as pending
        await prisma.eventOutbox.update({
          where: { id: event.id },
          data: {
            payload: {
              ...(event.payload as object),
              retry_count: retryCount + 1,
              last_error: error.message,
              last_retry_at: new Date().toISOString(),
            },
          },
        });
        logger.warn(`Event will be retried: ${event.id}`, { attempt: retryCount + 1, maxAttempts: CONFIG.MAX_RETRY_ATTEMPTS });
      }
    }
  }

  /**
   * Execute a promise with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Handler timeout')), timeoutMs)
      ),
    ]);
  }

  /**
   * Mark event as successfully published
   */
  private async markAsPublished(eventId: string): Promise<void> {
    await prisma.eventOutbox.update({
      where: { id: eventId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Move failed event to Dead Letter Queue
   */
  private async moveToDLQ(event: EventOutbox, errorMessage: string): Promise<void> {
    const retryCount = (event.payload as any).retry_count || 0;

    await prisma.$transaction([
      // Create DLQ entry
      prisma.eventOutboxFailure.create({
        data: {
          originalOutboxId: event.id,
          payload: event.payload,
          errorSummary: errorMessage.slice(0, 1000), // Limit error message length
          retryCount,
          failedAt: new Date(),
        },
      }),
      // Mark original as failed
      prisma.eventOutbox.update({
        where: { id: event.id },
        data: {
          status: 'failed',
        },
      }),
    ]);

    logger.error(`Event moved to DLQ: ${event.id}`, { retryCount });
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  /**
   * Handle: reports.report.submitted
   * Trigger: When a parent submits a new report
   * Action: Create user notification for specialist + email if allowed
   */
  private async handleReportSubmitted(payload: EventPayload, event: EventOutbox): Promise<void> {
    const { reportId, assignmentId, childId, parentId, specialistId } = payload;

    if (!specialistId) {
      logger.warn('No specialistId in report.submitted event', { payload });
      return;
    }

    // Get child name for notification
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true, lastName: true },
    });

    const childName = child ? `${child.firstName} ${child.lastName}` : 'ребенка';

    // Create in-app notification for specialist
    await userNotificationService.createUserNotification({
      userId: specialistId,
      type: 'report_submitted',
      title: 'Новый отчет',
      body: `Родитель отправил отчет о занятии с ${childName}`,
      link: `/dashboard/reports/${reportId}`,
    });

    // Check if email notification is allowed
    const isEmailAllowed = await preferencesService.isNotificationAllowed(
      specialistId,
      'report_submitted',
      'email'
    );

    if (isEmailAllowed) {
      // Create delivery notification for email
      await deliveryService.createDeliveryNotification({
        recipientId: specialistId,
        channel: 'email',
        template: 'report_submitted',
        payload: {
          reportId,
          assignmentId,
          childId,
          childName,
          parentId,
        },
      });
    }

    logger.info('Report submitted notification created', { reportId, specialistId });
  }

  /**
   * Handle: reports.report.reviewed
   * Trigger: When a specialist reviews a report
   * Action: Create user notification for parent + email if allowed
   */
  private async handleReportReviewed(payload: EventPayload, event: EventOutbox): Promise<void> {
    const { reportId, assignmentId, childId, parentId, specialistId, reviewStatus } = payload;

    if (!parentId) {
      logger.warn('No parentId in report.reviewed event', { payload });
      return;
    }

    // Get child name for notification
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true, lastName: true },
    });

    const childName = child ? `${child.firstName} ${child.lastName}` : 'ребенка';

    // Determine notification title and body based on review status
    let title = 'Отчет проверен';
    let body = '';

    switch (reviewStatus) {
      case 'approved':
        title = 'Отчет одобрен';
        body = `Специалист проверил отчет о занятии с ${childName}. Статус: Одобрено`;
        break;
      case 'needs_attention':
        title = 'Отчет требует внимания';
        body = `Специалист проверил отчет о занятии с ${childName}. Требуется ваше внимание`;
        break;
      case 'rejected':
        title = 'Отчет отклонен';
        body = `Специалист проверил отчет о занятии с ${childName}. Статус: Отклонен`;
        break;
      default:
        body = `Специалист проверил отчет о занятии с ${childName}`;
    }

    // Create in-app notification for parent
    await userNotificationService.createUserNotification({
      userId: parentId,
      type: 'report_reviewed',
      title,
      body,
      link: `/dashboard/reports/${reportId}`,
    });

    // Check if email notification is allowed
    const isEmailAllowed = await preferencesService.isNotificationAllowed(
      parentId,
      'report_reviewed',
      'email'
    );

    if (isEmailAllowed) {
      // Create delivery notification for email
      await deliveryService.createDeliveryNotification({
        recipientId: parentId,
        channel: 'email',
        template: 'report_reviewed',
        payload: {
          reportId,
          assignmentId,
          childId,
          childName,
          specialistId,
          reviewStatus,
        },
      });
    }

    logger.info('Report reviewed notification created', { reportId, parentId, reviewStatus });
  }

  /**
   * Handle: assignments.assignment.created
   * Trigger: When a new assignment is created
   * Action: Send immediate in-app notification + schedule email reminder for 24h before due date
   */
  private async handleAssignmentCreated(payload: EventPayload, event: EventOutbox): Promise<void> {
    const { assignmentId, childId, parentId, dueDate } = payload;

    if (!parentId || !dueDate) {
      logger.warn('Missing parentId or dueDate in assignment.created event', { payload });
      return;
    }

    // Get child name for notification
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true, lastName: true },
    });

    const childName = child ? `${child.firstName} ${child.lastName}` : 'ребенка';

    // ALWAYS create in-app notification immediately when assignment is created
    // This ensures parents are informed regardless of due date
    await userNotificationService.createUserNotification({
      userId: parentId,
      type: 'assignment_reminder',
      title: 'Новое задание',
      body: `Вам назначено новое задание для ${childName}`,
      link: `/dashboard/assignments/${assignmentId}`,
    });

    // Calculate reminder time (24 hours before due date)
    const dueDateObj = new Date(dueDate);
    const reminderTime = new Date(dueDateObj);
    reminderTime.setHours(reminderTime.getHours() - 24);

    // Schedule email reminder only if reminder time is in the future
    // If due date is less than 24 hours away, we skip the email reminder
    // (parent already got in-app notification)
    if (reminderTime > new Date()) {
      const isEmailAllowed = await preferencesService.isNotificationAllowed(
        parentId,
        'assignment_reminder',
        'email'
      );

      if (isEmailAllowed) {
        await deliveryService.createDeliveryNotification({
          recipientId: parentId,
          channel: 'email',
          template: 'assignment_reminder',
          payload: {
            assignmentId,
            childId,
            childName,
            dueDate,
          },
          scheduledAt: reminderTime,
        });
      }

      logger.info('Assignment created: in-app notification sent, email reminder scheduled', {
        assignmentId,
        parentId,
        reminderTime,
      });
    } else {
      logger.info('Assignment created: in-app notification sent (due date too soon for email reminder)', {
        assignmentId,
        parentId,
        dueDate,
      });
    }
  }

  /**
   * Handle: assignments.assignment.status_changed
   * Trigger: When assignment status changes
   * Action: Notify relevant users
   */
  private async handleAssignmentStatusChanged(payload: EventPayload, event: EventOutbox): Promise<void> {
    const { assignmentId, childId, parentId, specialistId, status } = payload;

    // Notify parent if assignment is completed
    if (status === 'completed' && parentId) {
      await userNotificationService.createUserNotification({
        userId: parentId,
        type: 'route_updated',
        title: 'Задание завершено',
        body: 'Задание успешно завершено',
        link: `/dashboard/assignments/${assignmentId}`,
      });
    }

    // Notify specialist if assignment status changes
    if (specialistId) {
      await userNotificationService.createUserNotification({
        userId: specialistId,
        type: 'route_updated',
        title: 'Статус задания изменен',
        body: `Статус задания изменен на: ${status}`,
        link: `/dashboard/assignments/${assignmentId}`,
      });
    }

    logger.info('Assignment status changed notification created', { assignmentId, status });
  }

  /**
   * Handle: assignments.assignment.overdue
   * Trigger: When assignment becomes overdue
   * Action: Send urgent notification
   */
  private async handleAssignmentOverdue(payload: EventPayload, event: EventOutbox): Promise<void> {
    const { assignmentId, childId, parentId } = payload;

    if (!parentId) {
      logger.warn('No parentId in assignment.overdue event', { payload });
      return;
    }

    // Create urgent in-app notification
    await userNotificationService.createUserNotification({
      userId: parentId,
      type: 'assignment_overdue',
      title: '⚠️ Задание просрочено',
      body: 'У вас есть просроченное задание, которое требует выполнения',
      link: `/dashboard/assignments/${assignmentId}`,
    });

    // Send urgent email notification
    const isEmailAllowed = await preferencesService.isNotificationAllowed(
      parentId,
      'assignment_overdue',
      'email'
    );

    if (isEmailAllowed) {
      await deliveryService.createDeliveryNotification({
        recipientId: parentId,
        channel: 'email',
        template: 'assignment_overdue',
        payload: {
          assignmentId,
          childId,
        },
      });
    }

    logger.info('Assignment overdue notification created', { assignmentId, parentId });
  }
}

// ============================================================
// Standalone Execution
// ============================================================

/**
 * Run consumer as standalone process
 *
 * Usage:
 *   tsx src/consumers/event-consumer.ts
 */
if (require.main === module) {
  const consumer = new EventConsumer();

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down event consumer...');
    consumer.stop();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start consumer
  consumer.start().catch(error => {
    logger.error('Fatal error in event consumer', { error });
    process.exit(1);
  });
}

export default EventConsumer;

