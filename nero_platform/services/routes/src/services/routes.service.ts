/**
 * Routes Service - Упрощенная бизнес-логика управления маршрутами
 */

import { PrismaClient, Route } from '@neiro/database';
import { AppError } from '../utils/AppError';
import { CreateRouteInput, UpdateRouteInput, ListRoutesQuery } from '../validators/routes.validators';
import * as eventsService from './events.service';

const prisma = new PrismaClient();

export async function createRoute(data: CreateRouteInput, userId: string): Promise<Route> {
  // Проверка активного маршрута для ребенка
  const activeRoute = await prisma.route.findFirst({
    where: { childId: data.childId, status: 'active' }
  });

  if (activeRoute) {
    throw new AppError('У ребенка уже есть активный маршрут', 409, 'ACTIVE_ROUTE_EXISTS');
  }

  const route = await prisma.route.create({
    data: {
      childId: data.childId,
      leadSpecialistId: data.leadSpecialistId,
      templateId: data.templateId,
      title: data.title,
      summary: data.summary,
      planHorizonWeeks: data.planHorizonWeeks,
      status: 'draft'
    }
  });

  await eventsService.publishRouteCreated(route.id, route.childId, userId);
  console.log(`✅ Создан маршрут: ${route.title} (${route.id})`);

  return route;
}

export async function listRoutes(query: ListRoutesQuery): Promise<{ data: Route[]; meta: any }> {
  const { childId, status, limit = 20, cursor } = query;

  const where: any = {};
  if (childId) where.childId = childId;
  if (status) where.status = status;

  const paginationOptions: any = {
    take: limit + 1,
    orderBy: { createdAt: 'desc' }
  };

  if (cursor) {
    paginationOptions.cursor = { id: cursor };
    paginationOptions.skip = 1;
  }

  const routes = await prisma.route.findMany({ where, ...paginationOptions });

  const hasMore = routes.length > limit;
  const data = hasMore ? routes.slice(0, limit) : routes;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;
  const total = await prisma.route.count({ where });

  return { data, meta: { total, hasMore, nextCursor } };
}

export async function getRouteById(id: string): Promise<Route> {
  const route = await prisma.route.findUnique({ where: { id } });
  if (!route) {
    throw new AppError('Маршрут не найден', 404, 'ROUTE_NOT_FOUND');
  }
  return route;
}

export async function updateRoute(id: string, data: UpdateRouteInput, userId: string): Promise<Route> {
  const oldRoute = await getRouteById(id);

  // Создаем объект изменений для версионирования
  const changes: Record<string, { old: any; new: any }> = {};
  for (const [key, newValue] of Object.entries(data)) {
    const oldValue = (oldRoute as any)[key];
    if (oldValue !== newValue) {
      changes[key] = { old: oldValue, new: newValue };
    }
  }

  // Обновляем маршрут
  const updatedRoute = await prisma.route.update({ where: { id }, data });

  // Создаем ревизию с финальным состоянием
  await createRevision(id, { changes, snapshot: updatedRoute }, userId, 'Route updated');

  console.log(`✅ Обновлен маршрут: ${updatedRoute.title} (${updatedRoute.id}), создана ревизия`);
  return updatedRoute;
}

export async function activateRoute(id: string, userId: string): Promise<Route> {
  const route = await getRouteById(id);
  if (route.status === 'active') {
    throw new AppError('Маршрут уже активен', 400, 'ALREADY_ACTIVE');
  }

  // Constitution Check #1: Только один активный маршрут на ребенка
  const existingActiveRoute = await prisma.route.findFirst({
    where: {
      childId: route.childId,
      status: 'active',
      id: { not: id }
    }
  });

  if (existingActiveRoute) {
    throw new AppError(
      'У ребенка уже есть активный маршрут. Завершите или приостановите его перед активацией нового.',
      409,
      'ACTIVE_ROUTE_EXISTS'
    );
  }

  // Constitution Check #2: Нельзя активировать пустой маршрут
  const routeWithGoals = await prisma.route.findUnique({
    where: { id },
    include: {
      goals: true,
      phases: true
    }
  });

  if (!routeWithGoals) {
    throw new AppError('Маршрут не найден', 404, 'ROUTE_NOT_FOUND');
  }

  const hasGoals = routeWithGoals.goals && routeWithGoals.goals.length > 0;
  const hasPhases = routeWithGoals.phases && routeWithGoals.phases.length > 0;

  if (!hasGoals && !hasPhases) {
    throw new AppError(
      'Невозможно активировать пустой маршрут. Добавьте хотя бы одну цель или фазу.',
      400,
      'EMPTY_ROUTE'
    );
  }

  const startDate = new Date();
  const changes = {
    status: { old: route.status, new: 'active' },
    startDate: { old: route.startDate, new: startDate }
  };

  const updatedRoute = await prisma.route.update({
    where: { id },
    data: { status: 'active', startDate }
  });

  await createRevision(id, { changes, snapshot: updatedRoute }, userId, 'Route activated');
  await eventsService.publishRouteActivated(id, userId);
  console.log(`✅ Активирован маршрут: ${updatedRoute.title} (${updatedRoute.id}), создана ревизия`);

  return updatedRoute;
}

export async function completeRoute(id: string, userId: string): Promise<Route> {
  const route = await getRouteById(id);

  // Constitution Check #3: Нельзя завершить маршрут с открытыми назначениями
  const openAssignments = await prisma.assignment.count({
    where: {
      routeId: id,
      status: { in: ['scheduled', 'in_progress'] }
    }
  });

  if (openAssignments > 0) {
    throw new AppError(
      `Невозможно завершить маршрут. Есть ${openAssignments} незавершенных назначений.`,
      400,
      'OPEN_ASSIGNMENTS_EXIST'
    );
  }

  const endDate = new Date();
  const changes = {
    status: { old: route.status, new: 'completed' },
    endDate: { old: route.endDate, new: endDate }
  };

  const updatedRoute = await prisma.route.update({
    where: { id },
    data: { status: 'completed', endDate }
  });

  await createRevision(id, { changes, snapshot: updatedRoute }, userId, 'Route completed');
  await eventsService.publishRouteCompleted(id, userId);
  console.log(`✅ Завершен маршрут: ${updatedRoute.title} (${updatedRoute.id}), создана ревизия`);

  return updatedRoute;
}

/**
 * Создание ревизии изменений маршрута
 * @param routeId - ID маршрута
 * @param payload - JSON с полным снимком состояния маршрута или изменениями
 * @param userId - ID специалиста, внесшего изменения
 * @param changeReason - Причина изменения (опционально)
 */
async function createRevision(
  routeId: string,
  payload: Record<string, any>,
  userId: string,
  changeReason?: string
) {
  // Пропускаем создание ревизии, если данных нет
  if (Object.keys(payload).length === 0) {
    return null;
  }

  // Получаем текущую версию (максимальная версия + 1)
  const lastRevision = await prisma.routeRevisionHistory.findFirst({
    where: { routeId },
    orderBy: { version: 'desc' }
  });

  const version = lastRevision ? lastRevision.version + 1 : 1;

  return prisma.routeRevisionHistory.create({
    data: {
      routeId,
      version,
      payload,
      changedBy: userId,
      changeReason
    }
  });
}

/**
 * Получение истории изменений маршрута
 * @param routeId - ID маршрута
 */
export async function getRouteHistory(routeId: string) {
  await getRouteById(routeId); // Проверяем существование маршрута

  const history = await prisma.routeRevisionHistory.findMany({
    where: { routeId },
    orderBy: { version: 'desc' }
  });

  return history;
}


