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

/**
 * Получение истории изменений маршрута
 * GET /routes/v1/:id/history
 */
export async function getRouteHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const history = await routesService.getRouteHistory(id);
    res.status(200).json({
      success: true,
      data: history,
      meta: { total: history.length }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Получение целей маршрута
 * GET /routes/v1/:id/goals
 */
export async function getRouteGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const goals = await routesService.getRouteGoals(id);
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
}

/**
 * Создание цели маршрута
 * POST /routes/v1/:id/goals
 */
export async function createRouteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const goal = await routesService.createRouteGoal(id, req.body, user.userId);
    res.status(201).json({ success: true, data: goal, message: 'Цель добавлена' });
  } catch (error) {
    next(error);
  }
}

/**
 * Обновление цели маршрута
 * PUT /routes/v1/:id/goals/:goalId
 */
export async function updateRouteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, goalId } = req.params;
    const user = (req as any).user;
    const goal = await routesService.updateRouteGoal(id, goalId, req.body, user.userId);
    res.status(200).json({ success: true, data: goal, message: 'Цель обновлена' });
  } catch (error) {
    next(error);
  }
}

/**
 * Удаление цели маршрута
 * DELETE /routes/v1/:id/goals/:goalId
 */
export async function deleteRouteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, goalId } = req.params;
    const user = (req as any).user;
    await routesService.deleteRouteGoal(id, goalId, user.userId);
    res.status(200).json({ success: true, message: 'Цель удалена' });
  } catch (error) {
    next(error);
  }
}

/**
 * Получение фаз маршрута
 * GET /routes/v1/:id/phases
 */
export async function getRoutePhases(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const phases = await routesService.getRoutePhases(id);
    res.status(200).json({ success: true, data: phases });
  } catch (error) {
    next(error);
  }
}

/**
 * Создание фазы маршрута
 * POST /routes/v1/:id/phases
 */
export async function createRoutePhase(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const phase = await routesService.createRoutePhase(id, req.body, user.userId);
    res.status(201).json({ success: true, data: phase, message: 'Фаза добавлена' });
  } catch (error) {
    next(error);
  }
}

/**
 * Обновление фазы маршрута
 * PUT /routes/v1/:id/phases/:phaseId
 */
export async function updateRoutePhase(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, phaseId } = req.params;
    const user = (req as any).user;
    const phase = await routesService.updateRoutePhase(id, phaseId, req.body, user.userId);
    res.status(200).json({ success: true, data: phase, message: 'Фаза обновлена' });
  } catch (error) {
    next(error);
  }
}

/**
 * Удаление фазы маршрута
 * DELETE /routes/v1/:id/phases/:phaseId
 */
export async function deleteRoutePhase(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, phaseId } = req.params;
    const user = (req as any).user;
    await routesService.deleteRoutePhase(id, phaseId, user.userId);
    res.status(200).json({ success: true, message: 'Фаза удалена' });
  } catch (error) {
    next(error);
  }
}


