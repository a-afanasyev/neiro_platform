/**
 * Templates Controller
 * 
 * Обработчики HTTP запросов для Templates API
 */

import { Request, Response, NextFunction } from 'express';
import * as templatesService from '../services/templates.service';
import { ListTemplatesQuery } from '../validators/templates.validators';

export async function listTemplates(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as ListTemplatesQuery;

    const result = await templatesService.listTemplates(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}

export async function getTemplateById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const template = await templatesService.getTemplateById(id);

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
}

export async function createTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;
    const data = req.body;

    const template = await templatesService.createTemplate(data, user.userId);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Шаблон успешно создан'
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const data = req.body;

    const template = await templatesService.updateTemplate(id, data, user.userId);

    res.status(200).json({
      success: true,
      data: template,
      message: 'Шаблон успешно обновлен'
    });
  } catch (error) {
    next(error);
  }
}

export async function publishTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const template = await templatesService.publishTemplate(id, user.userId);

    res.status(200).json({
      success: true,
      data: template,
      message: 'Шаблон успешно опубликован'
    });
  } catch (error) {
    next(error);
  }
}

export async function archiveTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    await templatesService.archiveTemplate(id, user.userId);

    res.status(200).json({
      success: true,
      message: 'Шаблон успешно архивирован'
    });
  } catch (error) {
    next(error);
  }
}

export async function cloneTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const data = req.body;

    const template = await templatesService.cloneTemplate(id, data, user.userId);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Шаблон успешно клонирован'
    });
  } catch (error) {
    next(error);
  }
}


