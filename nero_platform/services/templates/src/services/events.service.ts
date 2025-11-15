/**
 * Events Service
 * 
 * Публикация доменных событий в Postgres Outbox
 */

import { PrismaClient } from '@neiro/database';

const prisma = new PrismaClient();

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

export async function publishTemplatePublished(
  templateId: string,
  slug: string,
  version: number,
  actorId: string
): Promise<void> {
  await publishEvent(
    'template',
    templateId,
    'templates.template.published',
    {
      template_id: templateId,
      slug,
      version,
      published_at: new Date().toISOString()
    },
    actorId
  );
}

export async function publishTemplateUpdated(
  templateId: string,
  version: number,
  updatedFields: string[],
  actorId: string
): Promise<void> {
  await publishEvent(
    'template',
    templateId,
    'templates.template.updated',
    {
      template_id: templateId,
      version,
      updated_fields: updatedFields,
      updated_at: new Date().toISOString()
    },
    actorId
  );
}

export async function publishTemplateArchived(
  templateId: string,
  reason: string,
  actorId: string
): Promise<void> {
  await publishEvent(
    'template',
    templateId,
    'templates.template.archived',
    {
      template_id: templateId,
      archived_at: new Date().toISOString(),
      reason
    },
    actorId
  );
}


