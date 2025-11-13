import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import * as diagnosticsController from '../controllers/diagnostics.controller';
import * as validators from '../validators/diagnostics.validators';

const router = Router();

/**
 * @route   POST /diagnostics/v1/sessions
 * @desc    Создать новую диагностическую сессию
 * @access  Specialist, Admin
 */
router.post(
  '/sessions',
  authenticate,
  requireRoles(['SPECIALIST', 'ADMIN']),
  validate(validators.createSessionSchema),
  diagnosticsController.createSession
);

/**
 * @route   GET /diagnostics/v1/sessions
 * @desc    Получить список диагностических сессий (с фильтрацией)
 * @access  Specialist, Admin, Parent (только свои дети)
 */
router.get(
  '/sessions',
  authenticate,
  diagnosticsController.listSessions
);

/**
 * @route   GET /diagnostics/v1/sessions/:id
 * @desc    Получить детали конкретной диагностической сессии
 * @access  Specialist, Admin, Parent (если это их ребенок)
 */
router.get(
  '/sessions/:id',
  authenticate,
  diagnosticsController.getSession
);

/**
 * @route   PUT /diagnostics/v1/sessions/:id
 * @desc    Обновить диагностическую сессию
 * @access  Specialist, Admin
 */
router.put(
  '/sessions/:id',
  authenticate,
  requireRoles(['SPECIALIST', 'ADMIN']),
  validate(validators.updateSessionSchema),
  diagnosticsController.updateSession
);

/**
 * @route   POST /diagnostics/v1/sessions/:id/responses
 * @desc    Сохранить ответы на вопросы диагностической сессии
 * @access  Specialist, Admin
 */
router.post(
  '/sessions/:id/responses',
  authenticate,
  requireRoles(['SPECIALIST', 'ADMIN']),
  validate(validators.saveResponsesSchema),
  diagnosticsController.saveResponses
);

/**
 * @route   POST /diagnostics/v1/sessions/:id/complete
 * @desc    Завершить диагностическую сессию и рассчитать результаты
 * @access  Specialist, Admin
 */
router.post(
  '/sessions/:id/complete',
  authenticate,
  requireRoles(['SPECIALIST', 'ADMIN']),
  diagnosticsController.completeSession
);

/**
 * @route   GET /diagnostics/v1/sessions/:id/results
 * @desc    Получить результаты диагностической сессии
 * @access  Specialist, Admin, Parent (если это их ребенок)
 */
router.get(
  '/sessions/:id/results',
  authenticate,
  diagnosticsController.getResults
);

export default router;

