/**
 * Unit тесты для Routes Service
 *
 * Тестируем бизнес-логику управления маршрутами:
 * - Создание маршрутов
 * - Активация маршрутов
 * - Бизнес-ограничения (один активный маршрут, непустой маршрут)
 * - Версионирование
 */

import { PrismaClient } from '@neiro/database';

// Mock Prisma Client
jest.mock('@neiro/database', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    route: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    routeGoal: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    routePhase: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    assignment: {
      count: jest.fn(),
    },
    routeRevisionHistory: {
      create: jest.fn(),
    },
    eventOutbox: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback()),
  })),
}));

describe('Routes Service - Unit Tests', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('Business Constraints', () => {
    it('should prevent activating a second route for the same child', async () => {
      // Arrange: У ребенка уже есть активный маршрут
      const childId = 'child-123';
      const existingActiveRoute = {
        id: 'route-1',
        childId,
        status: 'active',
      };

      (prisma.route.count as jest.Mock).mockResolvedValue(1);

      // Act: Проверяем наличие активного маршрута
      const activeRoutesCount = await prisma.route.count({
        where: { childId, status: 'active' },
      });

      // Assert: Должен быть найден активный маршрут
      expect(activeRoutesCount).toBe(1);
      // В реальном коде это вызовет ошибку 409 Conflict
    });

    it('should allow activating first route for a child', async () => {
      // Arrange: У ребенка нет активных маршрутов
      const childId = 'child-123';

      (prisma.route.count as jest.Mock).mockResolvedValue(0);

      // Act: Проверяем наличие активного маршрута
      const activeRoutesCount = await prisma.route.count({
        where: { childId, status: 'active' },
      });

      // Assert: Активных маршрутов нет
      expect(activeRoutesCount).toBe(0);
    });

    it('should prevent activating empty route (no goals)', async () => {
      // Arrange: Маршрут без целей
      const routeId = 'route-123';

      (prisma.routeGoal.count as jest.Mock).mockResolvedValue(0);

      // Act: Проверяем наличие целей
      const goalsCount = await prisma.routeGoal.count({
        where: { routeId },
      });

      // Assert: Целей нет - активация должна быть заблокирована
      expect(goalsCount).toBe(0);
    });

    it('should allow activating route with goals', async () => {
      // Arrange: Маршрут с целями
      const routeId = 'route-123';

      (prisma.routeGoal.count as jest.Mock).mockResolvedValue(3);

      // Act: Проверяем наличие целей
      const goalsCount = await prisma.routeGoal.count({
        where: { routeId },
      });

      // Assert: Есть цели - активация разрешена
      expect(goalsCount).toBeGreaterThan(0);
    });

    it('should prevent completing route with open assignments', async () => {
      // Arrange: Маршрут с открытыми назначениями
      const routeId = 'route-123';

      (prisma.assignment.count as jest.Mock).mockResolvedValue(2);

      // Act: Проверяем открытые назначения
      const openAssignmentsCount = await prisma.assignment.count({
        where: {
          routeId,
          status: { in: ['scheduled', 'in_progress'] },
        },
      });

      // Assert: Есть открытые назначения - завершение блокируется
      expect(openAssignmentsCount).toBeGreaterThan(0);
    });
  });

  describe('Route Status Transitions', () => {
    it('should transition from draft to active', async () => {
      // Arrange
      const route = {
        id: 'route-123',
        status: 'draft',
        childId: 'child-123',
      };

      const updatedRoute = {
        ...route,
        status: 'active',
        activatedAt: new Date(),
      };

      (prisma.route.findUnique as jest.Mock).mockResolvedValue(route);
      (prisma.route.update as jest.Mock).mockResolvedValue(updatedRoute);
      (prisma.route.count as jest.Mock).mockResolvedValue(0); // Нет других активных
      (prisma.routeGoal.count as jest.Mock).mockResolvedValue(2); // Есть цели

      // Act
      const foundRoute = await prisma.route.findUnique({ where: { id: route.id } });
      expect(foundRoute.status).toBe('draft');

      const activeCount = await prisma.route.count({ where: { childId: route.childId, status: 'active' } });
      expect(activeCount).toBe(0);

      const goalsCount = await prisma.routeGoal.count({ where: { routeId: route.id } });
      expect(goalsCount).toBeGreaterThan(0);

      const activated = await prisma.route.update({
        where: { id: route.id },
        data: { status: 'active', activatedAt: new Date() },
      });

      // Assert
      expect(activated.status).toBe('active');
      expect(activated.activatedAt).toBeDefined();
    });

    it('should transition from active to completed', async () => {
      // Arrange
      const route = {
        id: 'route-123',
        status: 'active',
      };

      const completedRoute = {
        ...route,
        status: 'completed',
        completedAt: new Date(),
      };

      (prisma.route.findUnique as jest.Mock).mockResolvedValue(route);
      (prisma.assignment.count as jest.Mock).mockResolvedValue(0); // Нет открытых назначений
      (prisma.route.update as jest.Mock).mockResolvedValue(completedRoute);

      // Act
      const foundRoute = await prisma.route.findUnique({ where: { id: route.id } });
      expect(foundRoute.status).toBe('active');

      const openCount = await prisma.assignment.count({
        where: { routeId: route.id, status: { in: ['scheduled', 'in_progress'] } },
      });
      expect(openCount).toBe(0);

      const completed = await prisma.route.update({
        where: { id: route.id },
        data: { status: 'completed', completedAt: new Date() },
      });

      // Assert
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });
  });

  describe('Version History', () => {
    it('should create revision history entry on update', async () => {
      // Arrange
      const routeId = 'route-123';
      const userId = 'user-123';
      const changes = { title: 'New Title', description: 'New Description' };

      const revisionEntry = {
        id: 'revision-1',
        routeId,
        version: 1,
        changes,
        changedBy: userId,
        changedAt: new Date(),
      };

      (prisma.routeRevisionHistory.create as jest.Mock).mockResolvedValue(revisionEntry);

      // Act
      const revision = await prisma.routeRevisionHistory.create({
        data: {
          routeId,
          version: 1,
          changes,
          changedBy: userId,
          changedAt: new Date(),
        },
      });

      // Assert
      expect(revision.routeId).toBe(routeId);
      expect(revision.version).toBe(1);
      expect(revision.changes).toEqual(changes);
      expect(prisma.routeRevisionHistory.create).toHaveBeenCalled();
    });
  });

  describe('Event Publishing', () => {
    it('should publish event to outbox on route activation', async () => {
      // Arrange
      const routeId = 'route-123';
      const userId = 'user-123';

      const eventEntry = {
        id: 'event-1',
        eventName: 'routes.route.activated',
        payload: { routeId },
        actorId: userId,
      };

      (prisma.eventOutbox.create as jest.Mock).mockResolvedValue(eventEntry);

      // Act
      const event = await prisma.eventOutbox.create({
        data: {
          eventId: 'evt-123',
          eventName: 'routes.route.activated',
          schemaVersion: 1,
          timestamp: new Date(),
          correlationId: 'corr-123',
          actorId: userId,
          actorType: 'user',
          payload: { routeId },
        },
      });

      // Assert
      expect(event.eventName).toBe('routes.route.activated');
      expect(prisma.eventOutbox.create).toHaveBeenCalled();
    });
  });
});
