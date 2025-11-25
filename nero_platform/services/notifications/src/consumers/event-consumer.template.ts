/**
 * EventOutbox Consumer Template
 *
 * Этот шаблон предоставляет базовую структуру для обработки событий
 * из EventOutbox таблицы согласно MONTH_3_PLAN.md Task 3.1.4
 *
 * Usage:
 *   1. Скопируйте этот файл в ваш сервис (reports/analytics/notifications)
 *   2. Замените TODO секции на вашу бизнес-логику
 *   3. Добавьте обработчики для специфичных событий
 *   4. Запустите consumer в отдельном процессе или через cron
 *
 * Architecture:
 *   - Polling-based: каждые 10 секунд
 *   - Batch processing: до 100 событий за раз
 *   - At-least-once delivery: ретраи при ошибках
 *   - Dead Letter Queue: EventOutboxFailure для failed events
 */

import { PrismaClient, EventOutbox } from '@neiro/database';

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
   * TODO: Add your domain-specific event handlers here
   */
  private registerHandlers(): void {
    // Reports domain events
    this.handlers.set('reports.report.submitted', this.handleReportSubmitted.bind(this));
    this.handlers.set('reports.report.reviewed', this.handleReportReviewed.bind(this));

    // Assignments domain events
    this.handlers.set('assignments.assignment.created', this.handleAssignmentCreated.bind(this));
    this.handlers.set('assignments.assignment.status_changed', this.handleAssignmentStatusChanged.bind(this));
    this.handlers.set('assignments.assignment.overdue', this.handleAssignmentOverdue.bind(this));

    // TODO: Add more event handlers for your service
    // this.handlers.set('your.domain.event', this.handleYourEvent.bind(this));
  }

  /**
   * Start consuming events from EventOutbox
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Consumer already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 EventConsumer started');
    console.log(`   Poll interval: ${CONFIG.POLL_INTERVAL_MS}ms`);
    console.log(`   Batch size: ${CONFIG.BATCH_SIZE}`);
    console.log(`   Registered handlers: ${this.handlers.size}`);

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
    console.log('🛑 EventConsumer stopped');
  }

  /**
   * Poll EventOutbox for pending events
   */
  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.consumeBatch();
      } catch (error) {
        console.error('❌ Error in poll loop:', error);
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

    console.log(`📦 Processing ${events.length} events`);

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
      console.warn(`⚠️  No handler registered for event: ${event.eventName}`);
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
      console.log(`✅ Event processed: ${event.eventName} [${event.id}]`);

    } catch (error: any) {
      console.error(`❌ Error processing event ${event.id}:`, error.message);

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
        console.log(`🔄 Event will be retried: ${event.id} (attempt ${retryCount + 1}/${CONFIG.MAX_RETRY_ATTEMPTS})`);
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

    console.error(`💀 Event moved to DLQ: ${event.id} after ${retryCount} retries`);
  }

  // ============================================================
  // Event Handlers
  // TODO: Implement your business logic here
  // ============================================================

  /**
   * Handle: reports.report.submitted
   * Trigger: When a parent submits a new report
   * Action: Create user notification for specialist
   */
  private async handleReportSubmitted(payload: EventPayload, event: EventOutbox): Promise<void> {
    console.log('📝 Handling report.submitted:', payload);

    // TODO: Implement notification logic
    // Example:
    // const { report_id, specialist_id, child_name } = payload;
    //
    // await prisma.userNotification.create({
    //   data: {
    //     userId: specialist_id,
    //     type: 'report_submitted',
    //     title: 'Новый отчет',
    //     body: `Родитель отправил отчет о занятии с ${child_name}`,
    //     link: `/dashboard/reports/${report_id}`,
    //     status: 'unread',
    //   },
    // });
    //
    // // Also send email notification if preferences allow
    // await emailService.sendReportSubmittedEmail({ report_id, specialist_id });

    throw new Error('Handler not implemented: handleReportSubmitted');
  }

  /**
   * Handle: reports.report.reviewed
   * Trigger: When a specialist reviews a report
   * Action: Create user notification for parent
   */
  private async handleReportReviewed(payload: EventPayload, event: EventOutbox): Promise<void> {
    console.log('👀 Handling report.reviewed:', payload);

    // TODO: Implement notification logic
    throw new Error('Handler not implemented: handleReportReviewed');
  }

  /**
   * Handle: assignments.assignment.created
   * Trigger: When a new assignment is created
   * Action: Schedule reminder notification for 24h before due date
   */
  private async handleAssignmentCreated(payload: EventPayload, event: EventOutbox): Promise<void> {
    console.log('📋 Handling assignment.created:', payload);

    // TODO: Implement reminder scheduling logic
    // Example:
    // const { assignment_id, due_date, parent_id } = payload;
    //
    // const reminderTime = new Date(due_date);
    // reminderTime.setHours(reminderTime.getHours() - 24); // 24h before
    //
    // await prisma.notification.create({
    //   data: {
    //     channel: 'email',
    //     payload: {
    //       type: 'assignment_reminder',
    //       assignment_id,
    //       parent_id,
    //     },
    //     scheduledAt: reminderTime,
    //   },
    // });

    throw new Error('Handler not implemented: handleAssignmentCreated');
  }

  /**
   * Handle: assignments.assignment.status_changed
   * Trigger: When assignment status changes
   * Action: Notify relevant users
   */
  private async handleAssignmentStatusChanged(payload: EventPayload, event: EventOutbox): Promise<void> {
    console.log('🔄 Handling assignment.status_changed:', payload);

    // TODO: Implement status change notification
    throw new Error('Handler not implemented: handleAssignmentStatusChanged');
  }

  /**
   * Handle: assignments.assignment.overdue
   * Trigger: When assignment becomes overdue
   * Action: Send urgent notification
   */
  private async handleAssignmentOverdue(payload: EventPayload, event: EventOutbox): Promise<void> {
    console.log('⏰ Handling assignment.overdue:', payload);

    // TODO: Implement overdue notification
    throw new Error('Handler not implemented: handleAssignmentOverdue');
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
    console.log('\n🛑 Shutting down...');
    consumer.stop();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start consumer
  consumer.start().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export default EventConsumer;
