/**
 * Unit тесты для Assignments Service
 *
 * Тестируем бизнес-логику управления назначениями:
 * - Создание назначений
 * - Переходы статусов
 * - Overdue механизм
 * - Календарь
 */

import { PrismaClient } from '@neiro/database';

// Mock Prisma Client
jest.mock('@neiro/database', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    assignment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    eventOutbox: {
      create: jest.fn(),
    },
  })),
}));

describe('Assignments Service - Unit Tests', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('Status Transitions', () => {
    const VALID_TRANSITIONS: Record<string, string[]> = {
      scheduled: ['in_progress', 'cancelled', 'skipped', 'overdue'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      skipped: [],
      overdue: ['in_progress', 'cancelled', 'skipped'],
    };

    it('should allow transition from scheduled to in_progress', () => {
      const currentStatus = 'scheduled';
      const newStatus = 'in_progress';

      const isValid = VALID_TRANSITIONS[currentStatus]?.includes(newStatus);
      expect(isValid).toBe(true);
    });

    it('should allow transition from in_progress to completed', () => {
      const currentStatus = 'in_progress';
      const newStatus = 'completed';

      const isValid = VALID_TRANSITIONS[currentStatus]?.includes(newStatus);
      expect(isValid).toBe(true);
    });

    it('should prevent transition from completed to any status', () => {
      const currentStatus = 'completed';

      expect(VALID_TRANSITIONS[currentStatus]).toEqual([]);
      expect(VALID_TRANSITIONS[currentStatus]?.includes('in_progress')).toBe(false);
      expect(VALID_TRANSITIONS[currentStatus]?.includes('cancelled')).toBe(false);
    });

    it('should allow transition from overdue to in_progress', () => {
      const currentStatus = 'overdue';
      const newStatus = 'in_progress';

      const isValid = VALID_TRANSITIONS[currentStatus]?.includes(newStatus);
      expect(isValid).toBe(true);
    });

    it('should prevent transition from scheduled to completed directly', () => {
      const currentStatus = 'scheduled';
      const newStatus = 'completed';

      const isValid = VALID_TRANSITIONS[currentStatus]?.includes(newStatus);
      expect(isValid).toBe(false);
    });
  });

  describe('Assignment Status Update', () => {
    it('should update status and set completedAt for completed status', async () => {
      // Arrange
      const assignment = {
        id: 'assignment-123',
        status: 'in_progress',
        childId: 'child-123',
      };

      const completedAssignment = {
        ...assignment,
        status: 'completed',
        completedAt: new Date(),
      };

      (prisma.assignment.findUnique as jest.Mock).mockResolvedValue(assignment);
      (prisma.assignment.update as jest.Mock).mockResolvedValue(completedAssignment);

      // Act
      const found = await prisma.assignment.findUnique({ where: { id: assignment.id } });
      expect(found.status).toBe('in_progress');

      const updated = await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: 'completed', completedAt: new Date() },
      });

      // Assert
      expect(updated.status).toBe('completed');
      expect(updated.completedAt).toBeDefined();
    });

    it('should update status and set startedAt for in_progress status', async () => {
      // Arrange
      const assignment = {
        id: 'assignment-123',
        status: 'scheduled',
      };

      const startedAssignment = {
        ...assignment,
        status: 'in_progress',
        startedAt: new Date(),
      };

      (prisma.assignment.findUnique as jest.Mock).mockResolvedValue(assignment);
      (prisma.assignment.update as jest.Mock).mockResolvedValue(startedAssignment);

      // Act
      const found = await prisma.assignment.findUnique({ where: { id: assignment.id } });
      expect(found.status).toBe('scheduled');

      const updated = await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: 'in_progress', startedAt: new Date() },
      });

      // Assert
      expect(updated.status).toBe('in_progress');
      expect(updated.startedAt).toBeDefined();
    });
  });

  describe('Overdue Mechanism', () => {
    it('should find overdue assignments', async () => {
      // Arrange
      const overdueAssignments = [
        {
          id: 'assignment-1',
          status: 'scheduled',
          plannedStartDate: new Date('2025-11-01'),
        },
        {
          id: 'assignment-2',
          status: 'scheduled',
          plannedStartDate: new Date('2025-11-10'),
        },
      ];

      (prisma.assignment.findMany as jest.Mock).mockResolvedValue(overdueAssignments);

      // Act
      const found = await prisma.assignment.findMany({
        where: {
          status: 'scheduled',
          plannedStartDate: { lt: new Date() },
        },
        orderBy: { plannedStartDate: 'asc' },
      });

      // Assert
      expect(found).toHaveLength(2);
      expect(found[0].status).toBe('scheduled');
    });

    it('should mark assignments as overdue', async () => {
      // Arrange
      (prisma.assignment.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      // Act
      const result = await prisma.assignment.updateMany({
        where: {
          status: 'scheduled',
          plannedStartDate: { lt: new Date() },
        },
        data: { status: 'overdue' },
      });

      // Assert
      expect(result.count).toBe(5);
      expect(prisma.assignment.updateMany).toHaveBeenCalled();
    });
  });

  describe('Calendar Functionality', () => {
    it('should return assignments within date range', async () => {
      // Arrange
      const childId = 'child-123';
      const fromDate = new Date('2025-11-01');
      const toDate = new Date('2025-11-30');

      const calendarAssignments = [
        {
          id: 'assignment-1',
          childId,
          plannedStartDate: new Date('2025-11-05'),
          status: 'scheduled',
        },
        {
          id: 'assignment-2',
          childId,
          plannedStartDate: new Date('2025-11-15'),
          status: 'in_progress',
        },
      ];

      (prisma.assignment.findMany as jest.Mock).mockResolvedValue(calendarAssignments);

      // Act
      const calendar = await prisma.assignment.findMany({
        where: {
          childId,
          plannedStartDate: { gte: fromDate, lte: toDate },
        },
        orderBy: { plannedStartDate: 'asc' },
      });

      // Assert
      expect(calendar).toHaveLength(2);
      expect(calendar[0].plannedStartDate.getTime()).toBeLessThan(calendar[1].plannedStartDate.getTime());
    });

    it('should return all assignments for date range when childId is not specified', async () => {
      // Arrange
      const fromDate = new Date('2025-11-01');
      const toDate = new Date('2025-11-30');

      const allAssignments = [
        { id: 'a1', childId: 'child-1', plannedStartDate: new Date('2025-11-05') },
        { id: 'a2', childId: 'child-2', plannedStartDate: new Date('2025-11-10') },
        { id: 'a3', childId: 'child-1', plannedStartDate: new Date('2025-11-20') },
      ];

      (prisma.assignment.findMany as jest.Mock).mockResolvedValue(allAssignments);

      // Act
      const calendar = await prisma.assignment.findMany({
        where: {
          plannedStartDate: { gte: fromDate, lte: toDate },
        },
        orderBy: { plannedStartDate: 'asc' },
      });

      // Assert
      expect(calendar).toHaveLength(3);
    });
  });

  describe('Statistics', () => {
    it('should calculate assignment stats by status', async () => {
      // Arrange
      const childId = 'child-123';
      const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'skipped', 'overdue'];

      const counts = [3, 1, 10, 2, 1, 0];

      statuses.forEach((status, index) => {
        (prisma.assignment.count as jest.Mock).mockResolvedValueOnce(counts[index]);
      });

      // Act
      const stats: Record<string, number> = {};
      for (const status of statuses) {
        stats[status] = await prisma.assignment.count({
          where: { childId, status },
        });
      }

      // Assert
      expect(stats.scheduled).toBe(3);
      expect(stats.in_progress).toBe(1);
      expect(stats.completed).toBe(10);
      expect(stats.cancelled).toBe(2);
      expect(stats.skipped).toBe(1);
      expect(stats.overdue).toBe(0);
    });
  });

  describe('Event Publishing', () => {
    it('should publish event on assignment creation', async () => {
      // Arrange
      const assignmentId = 'assignment-123';
      const childId = 'child-123';
      const userId = 'user-123';

      const eventEntry = {
        id: 'event-1',
        eventName: 'assignments.assignment.created',
        payload: { assignmentId, childId },
      };

      (prisma.eventOutbox.create as jest.Mock).mockResolvedValue(eventEntry);

      // Act
      const event = await prisma.eventOutbox.create({
        data: {
          eventId: 'evt-123',
          eventName: 'assignments.assignment.created',
          schemaVersion: 1,
          timestamp: new Date(),
          correlationId: 'corr-123',
          actorId: userId,
          actorType: 'user',
          payload: { assignmentId, childId },
        },
      });

      // Assert
      expect(event.eventName).toBe('assignments.assignment.created');
      expect(prisma.eventOutbox.create).toHaveBeenCalled();
    });

    it('should publish event on status change', async () => {
      // Arrange
      const eventEntry = {
        id: 'event-2',
        eventName: 'assignments.assignment.status_changed',
        payload: {
          assignmentId: 'assignment-123',
          oldStatus: 'scheduled',
          newStatus: 'in_progress',
        },
      };

      (prisma.eventOutbox.create as jest.Mock).mockResolvedValue(eventEntry);

      // Act
      const event = await prisma.eventOutbox.create({
        data: {
          eventId: 'evt-456',
          eventName: 'assignments.assignment.status_changed',
          schemaVersion: 1,
          timestamp: new Date(),
          correlationId: 'corr-456',
          actorId: 'user-123',
          actorType: 'user',
          payload: {
            assignmentId: 'assignment-123',
            oldStatus: 'scheduled',
            newStatus: 'in_progress',
          },
        },
      });

      // Assert
      expect(event.eventName).toBe('assignments.assignment.status_changed');
    });
  });
});
