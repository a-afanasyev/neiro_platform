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
  await getRouteById(id);
  const route = await prisma.route.update({ where: { id }, data });
  console.log(`✅ Обновлен маршрут: ${route.title} (${route.id})`);
  return route;
}

export async function activateRoute(id: string, userId: string): Promise<Route> {
  const route = await getRouteById(id);
  if (route.status === 'active') {
    throw new AppError('Маршрут уже активен', 400, 'ALREADY_ACTIVE');
  }

  const updatedRoute = await prisma.route.update({
    where: { id },
    data: { status: 'active', startDate: new Date() }
  });

  await eventsService.publishRouteActivated(id, userId);
  console.log(`✅ Активирован маршрут: ${updatedRoute.title} (${updatedRoute.id})`);

  return updatedRoute;
}

export async function completeRoute(id: string, userId: string): Promise<Route> {
  await getRouteById(id);

  const updatedRoute = await prisma.route.update({
    where: { id },
    data: { status: 'completed', endDate: new Date() }
  });

  await eventsService.publishRouteCompleted(id, userId);
  console.log(`✅ Завершен маршрут: ${updatedRoute.title} (${updatedRoute.id})`);

  return updatedRoute;
}


