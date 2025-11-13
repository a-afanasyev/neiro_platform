/**
 * Events Service
 * Публикация доменных событий через Postgres Outbox
 */

import { PrismaClient } from '@neiro/database';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface EventPayload {
  [key: string]: any;
}

export async function publishEvent(
  eventName: string,
  payload: EventPayload,
  aggregateId?: string
): Promise<void> {
  try {
    await prisma.eventOutbox.create({
      data: {
        id: uuidv4(),
        eventName,
        aggregateType: eventName.split('.')[0],
        aggregateId: aggregateId || payload.userId || uuidv4(),
        payload: payload as any,
        status: 'pending',
      },
    });

    console.log(`📢 Событие опубликовано: ${eventName}`);
  } catch (error) {
    console.error(`❌ Ошибка публикации события ${eventName}:`, error);
  }
}

