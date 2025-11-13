import { Request, Response, NextFunction } from 'express';
import { getAvailableQuestionnaires, getQuestionnaireDetails } from '../services/questionnaires.service';

/**
 * Получить список доступных опросников
 * GET /diagnostics/v1/questionnaires
 */
export async function listQuestionnaires(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const questionnaires = await getAvailableQuestionnaires();

    res.json({
      success: true,
      data: questionnaires
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Получить детали конкретного опросника
 * GET /diagnostics/v1/questionnaires/:code
 */
export async function getQuestionnaire(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { code } = req.params;
    
    const questionnaire = await getQuestionnaireDetails(code);

    res.json({
      success: true,
      data: questionnaire
    });
  } catch (error) {
    next(error);
  }
}

