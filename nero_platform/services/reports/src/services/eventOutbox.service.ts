import { PrismaClient, EventOutbox } from '@neiro/database';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface CreateEventInput {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: Record<string, any>;
}

export class EventOutboxService {
  async createEvent(data: CreateEventInput): Promise<EventOutbox> {
    try {
      const event = await prisma.eventOutbox.create({
        data: {
          aggregateId: data.aggregateId,
          aggregateType: data.aggregateType,
          eventName: data.eventType,
          payload: data.payload as any,
          status: 'pending'
        }
      });

      logger.info('Event created in outbox', {
        eventId: event.id,
        eventType: data.eventType,
        aggregateId: data.aggregateId
      });

      return event;
    } catch (error) {
      logger.error('Failed to create event', { error, data });
      throw error;
    }
  }

  async markEventProcessed(eventId: string): Promise<void> {
    await prisma.eventOutbox.update({
      where: { id: eventId },
      data: {
        status: 'processed',
        processedAt: new Date()
      }
    });
  }

  async markEventFailed(eventId: string, error: string): Promise<void> {
    await prisma.eventOutbox.update({
      where: { id: eventId },
      data: {
        status: 'failed',
        lastError: error,
        attempts: {
          increment: 1
        }
      }
    });
  }

  async getPendingEvents(limit: number = 100): Promise<EventOutbox[]> {
    return prisma.eventOutbox.findMany({
      where: {
        status: 'pending',
        attempts: {
          lt: 3 // Max 3 attempts
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
}
