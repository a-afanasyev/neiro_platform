import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as questionnairesController from '../controllers/questionnaires.controller';

const router = Router();

/**
 * @route   GET /diagnostics/v1/questionnaires
 * @desc    Получить список доступных опросников
 * @access  Authenticated
 */
router.get(
  '/',
  authenticate,
  questionnairesController.listQuestionnaires
);

/**
 * @route   GET /diagnostics/v1/questionnaires/:code
 * @desc    Получить детали конкретного опросника (вопросы, варианты ответов)
 * @access  Authenticated
 */
router.get(
  '/:code',
  authenticate,
  questionnairesController.getQuestionnaire
);

export default router;

