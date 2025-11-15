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

export const publishAssignmentCreated = (assignmentId: string, childId: string, actorId: string) =>
  publishEvent('assignment', assignmentId, 'assignments.assignment.created', { assignment_id: assignmentId, child_id: childId }, actorId);

export const publishAssignmentStatusChanged = (assignmentId: string, status: string, actorId: string) =>
  publishEvent('assignment', assignmentId, 'assignments.assignment.status_changed', { assignment_id: assignmentId, status }, actorId);

export const publishAssignmentCancelled = (assignmentId: string, reason: string, actorId: string) =>
  publishEvent('assignment', assignmentId, 'assignments.assignment.cancelled', { assignment_id: assignmentId, reason }, actorId);

export const publishAssignmentOverdue = (assignmentId: string, actorId: string) =>
  publishEvent('assignment', assignmentId, 'assignments.assignment.overdue', { assignment_id: assignmentId }, actorId);

