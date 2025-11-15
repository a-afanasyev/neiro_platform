/**
 * Events Service - Публикация доменных событий в Postgres Outbox
 */

import { PrismaClient } from '@neiro/database';

const prisma = new PrismaClient();

export async function publishEvent(
  aggregateType: string,
  aggregateId: string,
  eventName: string,
  payload: Record<string, any>,
  actorId: string
): Promise<void> {
  try {
    await prisma.eventOutbox.create({
      data: {
        id: crypto.randomUUID(),
        eventName,
        aggregateType,
        aggregateId,
        payload: { ...payload, actor_id: actorId, timestamp: new Date().toISOString() } as any,
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

export const publishRouteCreated = (routeId: string, childId: string, actorId: string) =>
  publishEvent('route', routeId, 'routes.route.created', { route_id: routeId, child_id: childId }, actorId);

export const publishRouteActivated = (routeId: string, actorId: string) =>
  publishEvent('route', routeId, 'routes.route.activated', { route_id: routeId }, actorId);

export const publishRouteCompleted = (routeId: string, actorId: string) =>
  publishEvent('route', routeId, 'routes.route.completed', { route_id: routeId }, actorId);


