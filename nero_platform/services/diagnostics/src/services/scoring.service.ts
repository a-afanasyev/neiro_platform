import { AppError } from '../utils/AppError';

/**
 * Результаты диагностики
 */
interface DiagnosticResults {
  totalScore: number;
  interpretation: string;
  interpretationRu: string;
  subscales?: Record<string, number>;
  recommendations?: string[];
  recommendationsRu?: string[];
}

/**
 * Рассчитать результаты опросника на основе ответов
 */
export async function calculateQuestionnaireScore(
  questionnaireCode: string,
  responses: Record<string, any>
): Promise<DiagnosticResults> {
  switch (questionnaireCode) {
    case 'CARS':
      return calculateCARSScore(responses);
    case 'ABC':
      return calculateABCScore(responses);
    case 'ATEC':
      return calculateATECScore(responses);
    case 'VINELAND_3':
      return calculateVinelandScore(responses);
    case 'SPM_2':
      return calculateSPMScore(responses);
    case 'M_CHAT_R':
      return calculateMCHATScore(responses);
    default:
      throw new AppError(
        `Scoring not implemented for questionnaire: ${questionnaireCode}`,
        400,
        'SCORING_NOT_IMPLEMENTED'
      );
  }
}

/**
 * Рассчитать результаты CARS
 */
function calculateCARSScore(responses: Record<string, any>): DiagnosticResults {
  // Суммируем все ответы (каждый вопрос оценивается от 1 до 4)
  const scores = Object.values(responses).map(v => parseFloat(v as string));
  const totalScore = scores.reduce((sum, score) => sum + score, 0);

  // Интерпретация результатов CARS:
  // 15-29.5: No autism
  // 30-36.5: Mild-moderate autism
  // 37-60: Severe autism
  let interpretation = '';
  let interpretationRu = '';
  let recommendations: string[] = [];
  let recommendationsRu: string[] = [];

  if (totalScore < 30) {
    interpretation = 'No autism';
    interpretationRu = 'Признаки аутизма не выявлены';
    recommendations = [
      'Continue regular developmental monitoring',
      'No specific interventions needed at this time'
    ];
    recommendationsRu = [
      'Продолжайте регулярный мониторинг развития',
      'Специальные вмешательства не требуются'
    ];
  } else if (totalScore < 37) {
    interpretation = 'Mild to moderate autism';
    interpretationRu = 'Легкая или умеренная степень аутизма';
    recommendations = [
      'Recommend comprehensive developmental evaluation',
      'Consider early intervention services',
      'Behavioral therapy may be beneficial'
    ];
    recommendationsRu = [
      'Рекомендуется комплексная оценка развития',
      'Рассмотрите услуги ранней помощи',
      'Может быть полезна поведенческая терапия'
    ];
  } else {
    interpretation = 'Severe autism';
    interpretationRu = 'Тяжелая степень аутизма';
    recommendations = [
      'Immediate referral for comprehensive diagnostic evaluation',
      'Early intensive behavioral intervention recommended',
      'Speech and occupational therapy evaluation',
      'Family support services'
    ];
    recommendationsRu = [
      'Необходима немедленная комплексная диагностика',
      'Рекомендуется раннее интенсивное поведенческое вмешательство',
      'Оценка потребности в логопедической и эрготерапии',
      'Услуги поддержки семьи'
    ];
  }

  return {
    totalScore,
    interpretation,
    interpretationRu,
    recommendations,
    recommendationsRu
  };
}

/**
 * Рассчитать результаты ABC (упрощенная версия)
 */
function calculateABCScore(responses: Record<string, any>): DiagnosticResults {
  const totalScore = Object.values(responses).reduce((sum, v) => sum + (v as number), 0);

  return {
    totalScore,
    interpretation: 'ABC score calculated',
    interpretationRu: 'Результат ABC рассчитан',
    subscales: {
      sensory: 0, // Placeholder
      relating: 0,
      bodyUse: 0,
      language: 0,
      social: 0
    }
  };
}

/**
 * Рассчитать результаты ATEC (упрощенная версия)
 */
function calculateATECScore(responses: Record<string, any>): DiagnosticResults {
  const totalScore = Object.values(responses).reduce((sum, v) => sum + (v as number), 0);

  return {
    totalScore,
    interpretation: 'ATEC score calculated',
    interpretationRu: 'Результат ATEC рассчитан',
    subscales: {
      speechLanguageCommunication: 0,
      sociability: 0,
      sensoryAwareness: 0,
      healthBehavior: 0
    }
  };
}

/**
 * Рассчитать результаты Vineland-3 (упрощенная версия)
 */
function calculateVinelandScore(responses: Record<string, any>): DiagnosticResults {
  const totalScore = Object.values(responses).reduce((sum, v) => sum + (v as number), 0);

  return {
    totalScore,
    interpretation: 'Vineland-3 score calculated',
    interpretationRu: 'Результат Vineland-3 рассчитан',
    subscales: {
      communication: 0,
      dailyLivingSkills: 0,
      socialization: 0,
      motorSkills: 0
    }
  };
}

/**
 * Рассчитать результаты SPM-2 (упрощенная версия)
 */
function calculateSPMScore(responses: Record<string, any>): DiagnosticResults {
  const totalScore = Object.values(responses).reduce((sum, v) => sum + (v as number), 0);

  return {
    totalScore,
    interpretation: 'SPM-2 score calculated',
    interpretationRu: 'Результат SPM-2 рассчитан',
    subscales: {
      vision: 0,
      hearing: 0,
      touch: 0,
      bodyAwareness: 0,
      balance: 0,
      planning: 0
    }
  };
}

/**
 * Рассчитать результаты M-CHAT-R
 */
function calculateMCHATScore(responses: Record<string, any>): DiagnosticResults {
  // M-CHAT-R состоит из 20 вопросов с ответами да/нет
  // Критические вопросы: 2, 5, 12, 14, 15
  const criticalQuestions = ['q2', 'q5', 'q12', 'q14', 'q15'];
  
  let totalScore = 0;
  let criticalScore = 0;

  Object.entries(responses).forEach(([questionId, answer]) => {
    // Некоторые вопросы имеют обратную оценку
    const isReversed = ['q1', 'q4', 'q10', 'q15'].includes(questionId);
    const point = (answer === 'no' && !isReversed) || (answer === 'yes' && isReversed) ? 1 : 0;
    
    totalScore += point;
    
    if (criticalQuestions.includes(questionId)) {
      criticalScore += point;
    }
  });

  let interpretation = '';
  let interpretationRu = '';
  let recommendations: string[] = [];
  let recommendationsRu: string[] = [];

  if (totalScore < 3 && criticalScore < 2) {
    interpretation = 'Low risk for ASD';
    interpretationRu = 'Низкий риск РАС';
    recommendations = [
      'Continue routine developmental monitoring'
    ];
    recommendationsRu = [
      'Продолжайте плановый мониторинг развития'
    ];
  } else if (totalScore >= 3 && totalScore <= 7 && criticalScore < 2) {
    interpretation = 'Medium risk for ASD - follow-up recommended';
    interpretationRu = 'Средний риск РАС - рекомендуется повторное обследование';
    recommendations = [
      'Administer follow-up interview',
      'Monitor developmental progress closely'
    ];
    recommendationsRu = [
      'Проведите дополнительное интервью',
      'Внимательно отслеживайте развитие'
    ];
  } else {
    interpretation = 'High risk for ASD - evaluation recommended';
    interpretationRu = 'Высокий риск РАС - рекомендуется обследование';
    recommendations = [
      'Refer for comprehensive diagnostic evaluation',
      'Consider early intervention referral',
      'Developmental pediatrician consultation'
    ];
    recommendationsRu = [
      'Направьте на комплексную диагностику',
      'Рассмотрите направление на раннюю помощь',
      'Консультация педиатра по развитию'
    ];
  }

  return {
    totalScore,
    interpretation,
    interpretationRu,
    recommendations,
    recommendationsRu,
    subscales: {
      criticalItems: criticalScore
    }
  };
}

