import { AppError } from '../utils/AppError';

/**
 * Определение опросника
 */
interface Questionnaire {
  code: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  ageRange: string;
  duration: string;
  questions?: QuestionnaireQuestion[];
}

/**
 * Вопрос опросника
 */
interface QuestionnaireQuestion {
  id: string;
  text: string;
  textRu: string;
  type: 'single' | 'multiple' | 'scale' | 'text';
  options?: Array<{
    value: number | string;
    label: string;
    labelRu: string;
  }>;
  required: boolean;
}

/**
 * База данных опросников (в будущем переместить в БД)
 */
const QUESTIONNAIRES: Record<string, Questionnaire> = {
  'CARS': {
    code: 'CARS',
    name: 'Childhood Autism Rating Scale',
    nameRu: 'Шкала оценки детского аутизма (CARS)',
    description: 'A 15-item behavioral rating scale to identify children with autism',
    descriptionRu: 'Шкала из 15 пунктов для выявления детей с аутизмом',
    ageRange: '2-18 years',
    duration: '20-30 minutes',
    questions: [
      {
        id: 'q1',
        text: 'Relating to People',
        textRu: 'Отношения с людьми',
        type: 'scale',
        options: [
          { value: 1, label: 'No evidence of difficulty', labelRu: 'Нет признаков трудностей' },
          { value: 1.5, label: 'Mildly abnormal', labelRu: 'Слегка нарушено' },
          { value: 2, label: 'Mildly abnormal', labelRu: 'Слабо нарушено' },
          { value: 2.5, label: 'Moderately abnormal', labelRu: 'Умеренно нарушено' },
          { value: 3, label: 'Moderately abnormal', labelRu: 'Заметно нарушено' },
          { value: 3.5, label: 'Severely abnormal', labelRu: 'Сильно нарушено' },
          { value: 4, label: 'Severely abnormal', labelRu: 'Очень сильно нарушено' }
        ],
        required: true
      },
      {
        id: 'q2',
        text: 'Imitation',
        textRu: 'Имитация',
        type: 'scale',
        options: [
          { value: 1, label: 'No evidence of difficulty', labelRu: 'Нет признаков трудностей' },
          { value: 1.5, label: 'Mildly abnormal', labelRu: 'Слегка нарушено' },
          { value: 2, label: 'Mildly abnormal', labelRu: 'Слабо нарушено' },
          { value: 2.5, label: 'Moderately abnormal', labelRu: 'Умеренно нарушено' },
          { value: 3, label: 'Moderately abnormal', labelRu: 'Заметно нарушено' },
          { value: 3.5, label: 'Severely abnormal', labelRu: 'Сильно нарушено' },
          { value: 4, label: 'Severely abnormal', labelRu: 'Очень сильно нарушено' }
        ],
        required: true
      }
      // ... остальные 13 вопросов CARS (упрощено для базовой версии)
    ]
  },
  'ABC': {
    code: 'ABC',
    name: 'Autism Behavior Checklist',
    nameRu: 'Контрольный список аутичного поведения (ABC)',
    description: 'A checklist for identifying symptoms of autism',
    descriptionRu: 'Контрольный список для выявления симптомов аутизма',
    ageRange: '3-35 years',
    duration: '15-20 minutes'
  },
  'ATEC': {
    code: 'ATEC',
    name: 'Autism Treatment Evaluation Checklist',
    nameRu: 'Контрольный список оценки лечения аутизма (ATEC)',
    description: 'A one-page form designed to track treatment effectiveness',
    descriptionRu: 'Форма для отслеживания эффективности лечения',
    ageRange: 'All ages',
    duration: '10-15 minutes'
  },
  'VINELAND_3': {
    code: 'VINELAND_3',
    name: 'Vineland Adaptive Behavior Scales, Third Edition',
    nameRu: 'Шкалы адаптивного поведения Вайнленда, 3-е издание',
    description: 'Assessment of adaptive functioning in communication, daily living, and socialization',
    descriptionRu: 'Оценка адаптивного функционирования в коммуникации, повседневной жизни и социализации',
    ageRange: '0-90 years',
    duration: '45-60 minutes'
  },
  'SPM_2': {
    code: 'SPM_2',
    name: 'Sensory Processing Measure, Second Edition',
    nameRu: 'Мера сенсорной обработки, 2-е издание',
    description: 'Assessment of sensory processing issues',
    descriptionRu: 'Оценка проблем сенсорной обработки',
    ageRange: '2-18 years',
    duration: '30-40 minutes'
  },
  'MCHAT-R': {
    code: 'MCHAT-R',
    name: 'Modified Checklist for Autism in Toddlers, Revised',
    nameRu: 'Модифицированный контрольный список аутизма для малышей (M-CHAT-R)',
    description: 'Early screening tool for autism in toddlers',
    descriptionRu: 'Инструмент ранней диагностики аутизма у малышей',
    ageRange: '16-30 months',
    duration: '5-10 minutes'
  }
};

/**
 * Получить список доступных опросников
 */
export async function getAvailableQuestionnaires(): Promise<Questionnaire[]> {
  return Object.values(QUESTIONNAIRES).map(q => ({
    code: q.code,
    name: q.name,
    nameRu: q.nameRu,
    description: q.description,
    descriptionRu: q.descriptionRu,
    ageRange: q.ageRange,
    duration: q.duration
  }));
}

/**
 * Получить детали конкретного опросника
 */
export async function getQuestionnaireDetails(code: string): Promise<Questionnaire> {
  const questionnaire = QUESTIONNAIRES[code];
  
  if (!questionnaire) {
    throw new AppError(
      `Questionnaire with code '${code}' not found`,
      404,
      'QUESTIONNAIRE_NOT_FOUND'
    );
  }

  return questionnaire;
}

