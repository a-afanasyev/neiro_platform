/**
 * Assignments Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as assignmentsService from '../services/assignments.service';

export async function listAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as unknown as assignmentsService.ListAssignmentsQuery;
    const result = await assignmentsService.listAssignments(query);
    res.status(200).json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getAssignmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await assignmentsService.getAssignmentById(id);
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
}

export async function createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const assignment = await assignmentsService.createAssignment(req.body, user.userId);
    res.status(201).json({ success: true, data: assignment, message: 'Назначение создано' });
  } catch (error) {
    next(error);
  }
}

export async function updateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const assignment = await assignmentsService.updateAssignment(id, req.body, user.userId);
    res.status(200).json({ success: true, data: assignment, message: 'Назначение обновлено' });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const user = (req as any).user;
    const assignment = await assignmentsService.updateAssignmentStatus(id, status, user.userId, notes);
    res.status(200).json({ success: true, data: assignment, message: 'Статус обновлен' });
  } catch (error) {
    next(error);
  }
}

export async function completeAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const user = (req as any).user;
    const assignment = await assignmentsService.completeAssignment(id, user.userId, notes);
    res.status(200).json({ success: true, data: assignment, message: 'Назначение выполнено' });
  } catch (error) {
    next(error);
  }
}

export async function cancelAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = (req as any).user;
    const assignment = await assignmentsService.cancelAssignment(id, user.userId, reason);
    res.status(200).json({ success: true, data: assignment, message: 'Назначение отменено' });
  } catch (error) {
    next(error);
  }
}

export async function getOverdue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignments = await assignmentsService.getOverdueAssignments();
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
}

export async function markOverdue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await assignmentsService.markOverdueAssignments();
    res.status(200).json({ success: true, data: { count }, message: `Помечено: ${count}` });
  } catch (error) {
    next(error);
  }
}

export async function getCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { childId, startDate, endDate, fromDate, toDate } = req.query;

    // Поддержка обоих форматов параметров: startDate/endDate и fromDate/toDate
    const start = (startDate || fromDate) as string;
    const end = (endDate || toDate) as string;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать startDate и endDate (или fromDate и toDate)'
      }) as any;
    }

    // childId опционален - если не указан, возвращаем все назначения за период
    const assignments = childId
      ? await assignmentsService.getCalendar(childId as string, new Date(start), new Date(end))
      : await assignmentsService.getCalendarAll(new Date(start), new Date(end));

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { childId } = req.params;
    const stats = await assignmentsService.getAssignmentStats(childId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}
