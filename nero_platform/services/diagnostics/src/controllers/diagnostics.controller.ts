import { Request, Response, NextFunction } from 'express';
import { prisma } from '@neiro/database';
import { AppError } from '../utils/AppError';
import { publishEvent } from '../services/events.service';
import { calculateQuestionnaireScore } from '../services/scoring.service';

/**
 * Создать новую диагностическую сессию
 * POST /diagnostics/v1/sessions
 */
export async function createSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { childId, questionnaireCode, notes } = req.body;
    const specialistId = req.user!.id;

    // Проверяем, существует ли ребенок
    const child = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!child) {
      throw new AppError('Child not found', 404, 'CHILD_NOT_FOUND');
    }

    // Проверяем права доступа специалиста к этому ребенку
    if (req.user!.role === 'SPECIALIST') {
      const relationship = await prisma.childSpecialist.findFirst({
        where: {
          childId,
          specialistId
        }
      });

      if (!relationship) {
        throw new AppError('You do not have access to this child', 403, 'ACCESS_DENIED');
      }
    }

    // Создаем диагностическую сессию
    const session = await prisma.diagnosticSession.create({
      data: {
        childId,
        specialistId,
        questionnaireCode,
        status: 'IN_PROGRESS',
        responses: {},
        results: {},
        notes,
        startedAt: new Date()
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true
          }
        },
        specialist: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Публикуем событие
    await publishEvent('diagnostic.session.started', {
      sessionId: session.id,
      childId: session.childId,
      specialistId: session.specialistId,
      questionnaireCode: session.questionnaireCode
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить список диагностических сессий
 * GET /diagnostics/v1/sessions
 */
export async function listSessions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { childId, status, cursor, limit = '10' } = req.query;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Формируем условия фильтрации в зависимости от роли
    let where: any = {};

    if (userRole === 'PARENT') {
      // Родители видят только сессии своих детей
      const childRelationships = await prisma.childParent.findMany({
        where: { parentId: userId },
        select: { childId: true }
      });
      
      where.childId = {
        in: childRelationships.map(rel => rel.childId)
      };
    } else if (userRole === 'SPECIALIST') {
      // Специалисты видят только сессии детей, с которыми они работают
      where.specialistId = userId;
    }

    // Дополнительные фильтры
    if (childId) {
      where.childId = childId as string;
    }
    if (status) {
      where.status = status as string;
    }
    if (cursor) {
      where.id = { lt: cursor as string };
    }

    // Получаем сессии с пагинацией
    const sessions = await prisma.diagnosticSession.findMany({
      where,
      take: parseInt(limit as string) + 1,
      orderBy: { startedAt: 'desc' },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthDate: true
          }
        },
        specialist: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Определяем, есть ли следующая страница
    const hasMore = sessions.length > parseInt(limit as string);
    if (hasMore) {
      sessions.pop();
    }

    const nextCursor = hasMore ? sessions[sessions.length - 1].id : null;

    res.json({
      success: true,
      data: sessions,
      pagination: {
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить детали диагностической сессии
 * GET /diagnostics/v1/sessions/:id
 */
export async function getSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const session = await prisma.diagnosticSession.findUnique({
      where: { id },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true
          }
        },
        specialist: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      throw new AppError('Diagnostic session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Проверяем права доступа
    if (userRole === 'PARENT') {
      const relationship = await prisma.childParent.findFirst({
        where: {
          childId: session.childId,
          parentId: userId
        }
      });
      if (!relationship) {
        throw new AppError('You do not have access to this session', 403, 'ACCESS_DENIED');
      }
    } else if (userRole === 'SPECIALIST' && session.specialistId !== userId) {
      throw new AppError('You do not have access to this session', 403, 'ACCESS_DENIED');
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Обновить диагностическую сессию
 * PUT /diagnostics/v1/sessions/:id
 */
export async function updateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { notes, status } = req.body;
    const userId = req.user!.id;

    // Проверяем существование сессии
    const existingSession = await prisma.diagnosticSession.findUnique({
      where: { id }
    });

    if (!existingSession) {
      throw new AppError('Diagnostic session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Проверяем права доступа
    if (req.user!.role === 'SPECIALIST' && existingSession.specialistId !== userId) {
      throw new AppError('You do not have access to this session', 403, 'ACCESS_DENIED');
    }

    // Обновляем сессию
    const session = await prisma.diagnosticSession.update({
      where: { id },
      data: {
        notes,
        status,
        updatedAt: new Date()
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Публикуем событие
    await publishEvent('diagnostic.session.updated', {
      sessionId: session.id,
      childId: session.childId,
      specialistId: session.specialistId,
      status: session.status
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Сохранить ответы на вопросы диагностической сессии
 * POST /diagnostics/v1/sessions/:id/responses
 */
export async function saveResponses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { responses } = req.body;
    const userId = req.user!.id;

    // Проверяем существование сессии
    const existingSession = await prisma.diagnosticSession.findUnique({
      where: { id }
    });

    if (!existingSession) {
      throw new AppError('Diagnostic session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Проверяем права доступа
    if (req.user!.role === 'SPECIALIST' && existingSession.specialistId !== userId) {
      throw new AppError('You do not have access to this session', 403, 'ACCESS_DENIED');
    }

    // Обновляем ответы (мерджим с существующими)
    const currentResponses = existingSession.responses as any || {};
    const updatedResponses = { ...currentResponses, ...responses };

    const session = await prisma.diagnosticSession.update({
      where: { id },
      data: {
        responses: updatedResponses,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Завершить диагностическую сессию и рассчитать результаты
 * POST /diagnostics/v1/sessions/:id/complete
 */
export async function completeSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Проверяем существование сессии
    const existingSession = await prisma.diagnosticSession.findUnique({
      where: { id }
    });

    if (!existingSession) {
      throw new AppError('Diagnostic session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Проверяем права доступа
    if (req.user!.role === 'SPECIALIST' && existingSession.specialistId !== userId) {
      throw new AppError('You do not have access to this session', 403, 'ACCESS_DENIED');
    }

    // Проверяем, что сессия не завершена
    if (existingSession.status === 'COMPLETED') {
      throw new AppError('Session is already completed', 400, 'SESSION_ALREADY_COMPLETED');
    }

    // Рассчитываем результаты
    const results = await calculateQuestionnaireScore(
      existingSession.questionnaireCode,
      existingSession.responses as any
    );

    // Обновляем сессию
    const session = await prisma.diagnosticSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        results,
        completedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Публикуем событие
    await publishEvent('diagnostic.session.completed', {
      sessionId: session.id,
      childId: session.childId,
      specialistId: session.specialistId,
      questionnaireCode: session.questionnaireCode,
      results: session.results
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить результаты диагностической сессии
 * GET /diagnostics/v1/sessions/:id/results
 */
export async function getResults(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const session = await prisma.diagnosticSession.findUnique({
      where: { id },
      select: {
        id: true,
        childId: true,
        specialistId: true,
        questionnaireCode: true,
        status: true,
        results: true,
        completedAt: true,
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!session) {
      throw new AppError('Diagnostic session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Проверяем права доступа
    if (userRole === 'PARENT') {
      const relationship = await prisma.childParent.findFirst({
        where: {
          childId: session.childId,
          parentId: userId
        }
      });
      if (!relationship) {
        throw new AppError('You do not have access to this session', 403, 'ACCESS_DENIED');
      }
    } else if (userRole === 'SPECIALIST' && session.specialistId !== userId) {
      throw new AppError('You do not have access to this session', 403, 'ACCESS_DENIED');
    }

    // Проверяем, что сессия завершена
    if (session.status !== 'COMPLETED') {
      throw new AppError('Session is not completed yet', 400, 'SESSION_NOT_COMPLETED');
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        questionnaireCode: session.questionnaireCode,
        child: session.child,
        results: session.results,
        completedAt: session.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

