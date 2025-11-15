/**
 * Events Service
 * 
 * Публикация доменных событий в Postgres Outbox
 */

import { PrismaClient } from '@neiro/database';

const prisma = new PrismaClient();

/**
 * Базовая структура события
 */
interface BaseEvent {
  event_id: string;
  event_name: string;
  schema_version: number;
  timestamp: string;
  correlation_id: string;
  causation_id?: string;
  actor_id: string;
  actor_type: string;
  payload: Record<string, any>;
}

/**
 * Публикация события в Outbox
 */
export async function publishEvent(
  aggregateType: string,
  aggregateId: string,
  eventName: string,
  payload: Record<string, any>,
  actorId: string,
  actorType: string = 'specialist'
): Promise<void> {
  try {
    const event: BaseEvent = {
      event_id: crypto.randomUUID(),
      event_name: eventName,
      schema_version: 1,
      timestamp: new Date().toISOString(),
      correlation_id: crypto.randomUUID(),
      actor_id: actorId,
      actor_type: actorType,
      payload
    };

    await prisma.eventOutbox.create({
      data: {
        id: event.event_id,
        eventName: event.event_name,
        aggregateType,
        aggregateId,
        payload: event as any,
        status: 'pending',
        createdAt: new Date()
      }
    });

    console.log(`📤 Событие опубликовано: ${eventName} [${aggregateId}]`);
  } catch (error) {
    console.error(`❌ Ошибка публикации события ${eventName}:`, error);
    throw error;
  }
}

/**
 * Публикация события "упражнение опубликовано"
 */
export async function publishExercisePublished(
  exerciseId: string,
  slug: string,
  category: string,
  difficulty: string,
  actorId: string
): Promise<void> {
  await publishEvent(
    'exercise',
    exerciseId,
    'exercises.exercise.published',
    {
      exercise_id: exerciseId,
      slug,
      category,
      difficulty,
      published_at: new Date().toISOString()
    },
    actorId
  );
}

/**
 * Публикация события "упражнение обновлено"
 */
export async function publishExerciseUpdated(
  exerciseId: string,
  updatedFields: string[],
  actorId: string
): Promise<void> {
  await publishEvent(
    'exercise',
    exerciseId,
    'exercises.exercise.updated',
    {
      exercise_id: exerciseId,
      updated_fields: updatedFields,
      updated_at: new Date().toISOString()
    },
    actorId
  );
}

/**
 * Публикация события "упражнение архивировано"
 */
export async function publishExerciseRetired(
  exerciseId: string,
  reason: string,
  actorId: string
): Promise<void> {
  await publishEvent(
    'exercise',
    exerciseId,
    'exercises.exercise.retired',
    {
      exercise_id: exerciseId,
      retired_at: new Date().toISOString(),
      reason
    },
    actorId
  );
}


