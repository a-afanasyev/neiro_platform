/**
 * Assignments Service - Бизнес-логика управления назначениями
 */

import { PrismaClient, Assignment } from '@neiro/database';
import { AppError } from '../utils/AppError';
import * as eventsService from './events.service';

const prisma = new PrismaClient();

// Допустимые статусы назначений
export const ASSIGNMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SKIPPED: 'skipped',
  OVERDUE: 'overdue'
} as const;

// Допустимые переходы статусов
const VALID_TRANSITIONS: Record<string, string[]> = {
  scheduled: ['in_progress', 'cancelled', 'skipped', 'overdue'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  skipped: [],
  overdue: ['in_progress', 'cancelled', 'skipped']
};

export interface CreateAssignmentInput {
  routeId?: string;
  childId: string;
  specialistId: string;
  exerciseId?: string;
  title: string;
  description?: string;
  plannedStartDate: Date;
  durationMinutes?: number;
  location?: string;
  isHomework?: boolean;
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  plannedStartDate?: Date;
  durationMinutes?: number;
  location?: string;
}

export interface ListAssignmentsQuery {
  childId?: string;
  specialistId?: string;
  routeId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  cursor?: string;
}

export async function createAssignment(data: CreateAssignmentInput, userId: string): Promise<Assignment> {
  const assignment = await prisma.assignment.create({
    data: {
      ...data,
      status: ASSIGNMENT_STATUSES.SCHEDULED
    }
  });

  await eventsService.publishAssignmentCreated(assignment.id, assignment.childId, userId);
  console.log(`✅ Создано назначение: ${assignment.title} (${assignment.id})`);

  return assignment;
}

export async function listAssignments(query: ListAssignmentsQuery): Promise<{ data: Assignment[]; meta: any }> {
  const { childId, specialistId, routeId, status, fromDate, toDate, limit = 20, cursor } = query;

  const where: any = {};
  if (childId) where.childId = childId;
  if (specialistId) where.specialistId = specialistId;
  if (routeId) where.routeId = routeId;
  if (status) where.status = status;

  if (fromDate || toDate) {
    where.plannedStartDate = {};
    if (fromDate) where.plannedStartDate.gte = new Date(fromDate);
    if (toDate) where.plannedStartDate.lte = new Date(toDate);
  }

  const paginationOptions: any = {
    take: limit + 1,
    orderBy: { plannedStartDate: 'asc' }
  };

  if (cursor) {
    paginationOptions.cursor = { id: cursor };
    paginationOptions.skip = 1;
  }

  const assignments = await prisma.assignment.findMany({ where, ...paginationOptions });

  const hasMore = assignments.length > limit;
  const data = hasMore ? assignments.slice(0, limit) : assignments;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;
  const total = await prisma.assignment.count({ where });

  return { data, meta: { total, hasMore, nextCursor } };
}

export async function getAssignmentById(id: string): Promise<Assignment> {
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) {
    throw new AppError('Назначение не найдено', 404, 'ASSIGNMENT_NOT_FOUND');
  }
  return assignment;
}

export async function updateAssignment(id: string, data: UpdateAssignmentInput, userId: string): Promise<Assignment> {
  const existing = await getAssignmentById(id);

  if (['completed', 'cancelled', 'skipped'].includes(existing.status)) {
    throw new AppError('Невозможно редактировать завершенное назначение', 400, 'ASSIGNMENT_IMMUTABLE');
  }

  const assignment = await prisma.assignment.update({ where: { id }, data });
  console.log(`✅ Обновлено назначение: ${assignment.title} (${assignment.id})`);
  return assignment;
}

export async function updateAssignmentStatus(id: string, newStatus: string, userId: string, notes?: string): Promise<Assignment> {
  const assignment = await getAssignmentById(id);
  const currentStatus = assignment.status;

  if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
    throw new AppError(`Недопустимый переход: ${currentStatus} → ${newStatus}`, 400, 'INVALID_STATUS_TRANSITION');
  }

  const updateData: any = { status: newStatus };

  if (newStatus === ASSIGNMENT_STATUSES.COMPLETED) {
    updateData.completedAt = new Date();
  } else if (newStatus === ASSIGNMENT_STATUSES.IN_PROGRESS) {
    updateData.startedAt = new Date();
  }

  if (notes) updateData.notes = notes;

  const updatedAssignment = await prisma.assignment.update({ where: { id }, data: updateData });

  await eventsService.publishAssignmentStatusChanged(id, currentStatus, newStatus, userId);
  console.log(`✅ Статус: ${currentStatus} → ${newStatus} (${id})`);

  return updatedAssignment;
}

export async function startAssignment(id: string, userId: string): Promise<Assignment> {
  return updateAssignmentStatus(id, ASSIGNMENT_STATUSES.IN_PROGRESS, userId);
}

export async function completeAssignment(id: string, userId: string, notes?: string): Promise<Assignment> {
  return updateAssignmentStatus(id, ASSIGNMENT_STATUSES.COMPLETED, userId, notes);
}

export async function cancelAssignment(id: string, userId: string, reason?: string): Promise<Assignment> {
  return updateAssignmentStatus(id, ASSIGNMENT_STATUSES.CANCELLED, userId, reason);
}

export async function skipAssignment(id: string, userId: string, reason?: string): Promise<Assignment> {
  return updateAssignmentStatus(id, ASSIGNMENT_STATUSES.SKIPPED, userId, reason);
}

export async function getOverdueAssignments(): Promise<Assignment[]> {
  return prisma.assignment.findMany({
    where: { status: ASSIGNMENT_STATUSES.SCHEDULED, plannedStartDate: { lt: new Date() } },
    orderBy: { plannedStartDate: 'asc' }
  });
}

export async function markOverdueAssignments(): Promise<number> {
  const result = await prisma.assignment.updateMany({
    where: { status: ASSIGNMENT_STATUSES.SCHEDULED, plannedStartDate: { lt: new Date() } },
    data: { status: ASSIGNMENT_STATUSES.OVERDUE }
  });
  if (result.count > 0) console.log(`⏰ Просрочено: ${result.count} назначений`);
  return result.count;
}

export async function getCalendar(childId: string, fromDate: Date, toDate: Date): Promise<Assignment[]> {
  return prisma.assignment.findMany({
    where: { childId, plannedStartDate: { gte: fromDate, lte: toDate } },
    orderBy: { plannedStartDate: 'asc' }
  });
}

export async function getCalendarAll(fromDate: Date, toDate: Date): Promise<Assignment[]> {
  return prisma.assignment.findMany({
    where: { plannedStartDate: { gte: fromDate, lte: toDate } },
    orderBy: { plannedStartDate: 'asc' }
  });
}

export async function getAssignmentStats(childId: string): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};
  for (const status of Object.values(ASSIGNMENT_STATUSES)) {
    stats[status] = await prisma.assignment.count({ where: { childId, status } });
  }
  return stats;
}
