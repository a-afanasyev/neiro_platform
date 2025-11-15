/**
 * Routes Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as routesService from '../services/routes.service';
import { ListRoutesQuery } from '../validators/routes.validators';

export async function listRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as unknown as ListRoutesQuery;
    const result = await routesService.listRoutes(query);
    res.status(200).json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getRouteById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const route = await routesService.getRouteById(id);
    res.status(200).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
}

export async function createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const route = await routesService.createRoute(req.body, user.userId);
    res.status(201).json({ success: true, data: route, message: 'Маршрут успешно создан' });
  } catch (error) {
    next(error);
  }
}

export async function updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const route = await routesService.updateRoute(id, req.body, user.userId);
    res.status(200).json({ success: true, data: route, message: 'Маршрут успешно обновлен' });
  } catch (error) {
    next(error);
  }
}

export async function activateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const route = await routesService.activateRoute(id, user.userId);
    res.status(200).json({ success: true, data: route, message: 'Маршрут активирован' });
  } catch (error) {
    next(error);
  }
}

export async function completeRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const route = await routesService.completeRoute(id, user.userId);
    res.status(200).json({ success: true, data: route, message: 'Маршрут завершен' });
  } catch (error) {
    next(error);
  }
}


