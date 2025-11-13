/**
 * Events Service
 * 
 * Публикация доменных событий через Postgres Outbox
 */

import { prisma } from '@neiro/database';
import { v4 as uuidv4 } from 'uuid';

interface EventPayload {
  [key: string]: any;
}

/**
 * Публикация доменного события в Outbox
 * 
 * События будут обработаны фоновым воркером и отправлены подписчикам
 */
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
        aggregateType: eventName.split('.')[0], // diagnostic.session.started -> diagnostic
        aggregateId: aggregateId || payload.sessionId || uuidv4(),
        payload: payload as any, // Prisma JsonValue
        status: 'pending',
      },
    });

    console.log(`📢 Событие опубликовано: ${eventName}`);
  } catch (error) {
    console.error(`❌ Ошибка публикации события ${eventName}:`, error);
    // Не прерываем основной процесс при ошибке публикации события
  }
}

