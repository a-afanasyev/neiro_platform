/**
 * Exercises Controller
 * 
 * Обработчики HTTP запросов для Exercises API
 */

import { Request, Response, NextFunction } from 'express';
import * as exercisesService from '../services/exercises.service';
import { ListExercisesQuery } from '../validators/exercises.validators';

/**
 * GET /exercises/v1
 * Получение списка упражнений с фильтрацией
 */
export async function listExercises(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as ListExercisesQuery;
    const user = (req as any).user;

    const result = await exercisesService.listExercises(query, user.userId, user.role);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /exercises/v1/:id
 * Получение упражнения по ID
 */
export async function getExerciseById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const exercise = await exercisesService.getExerciseById(id);

    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /exercises/v1
 * Создание нового упражнения
 */
export async function createExercise(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;
    const data = req.body;

    const exercise = await exercisesService.createExercise(data, user.userId);

    res.status(201).json({
      success: true,
      data: exercise,
      message: 'Упражнение успешно создано'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /exercises/v1/:id
 * Обновление упражнения
 */
export async function updateExercise(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const data = req.body;

    const exercise = await exercisesService.updateExercise(id, data, user.userId);

    res.status(200).json({
      success: true,
      data: exercise,
      message: 'Упражнение успешно обновлено'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /exercises/v1/:id/publish
 * Публикация упражнения
 */
export async function publishExercise(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const exercise = await exercisesService.publishExercise(id, user.userId);

    res.status(200).json({
      success: true,
      data: exercise,
      message: 'Упражнение успешно опубликовано'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /exercises/v1/:id
 * Архивация упражнения
 */
export async function deleteExercise(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    await exercisesService.deleteExercise(id, user.userId);

    res.status(200).json({
      success: true,
      message: 'Упражнение успешно архивировано'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /exercises/v1/categories
 * Получение списка категорий
 */
export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = exercisesService.getCategories();

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
}


