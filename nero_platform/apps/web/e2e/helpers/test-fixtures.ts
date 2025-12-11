/**
 * E2E Test Fixtures
 *
 * Тестовые данные для E2E тестов
 */

/**
 * Тестовые пользователи
 */
export const testUsers = {
  admin: {
    email: 'admin@neiro.dev',
    password: 'admin123',
    role: 'admin' as const,
  },
  specialist: {
    email: 'specialist1@example.com',
    password: 'admin123',
    role: 'specialist' as const,
  },
  specialist2: {
    email: 'specialist2@example.com',
    password: 'admin123',
    role: 'specialist' as const,
  },
  parent: {
    email: 'parent1@example.com',
    password: 'admin123',
    role: 'parent' as const,
  },
  parent2: {
    email: 'parent2@example.com',
    password: 'admin123',
    role: 'parent' as const,
  },
  supervisor: {
    email: 'supervisor1@example.com',
    password: 'admin123',
    role: 'supervisor' as const,
  },
}

/**
 * Тестовые данные для создания пользователей
 */
export const testUserData = {
  newAdmin: {
    firstName: 'Тест',
    lastName: 'Администратор',
    email: 'test-admin@example.com',
    role: 'admin' as const,
  },
  newSpecialist: {
    firstName: 'Тест',
    lastName: 'Специалист',
    email: 'test-specialist@example.com',
    role: 'specialist' as const,
  },
  newParent: {
    firstName: 'Тест',
    lastName: 'Родитель',
    email: 'test-parent@example.com',
    role: 'parent' as const,
  },
}

/**
 * Тестовые данные для создания детей
 */
export const testChildData = {
  child1: {
    firstName: 'Мария',
    lastName: 'Тестова',
    dateOfBirth: '2020-05-15',
    diagnosis: 'Тестовый диагноз',
  },
  child2: {
    firstName: 'Петр',
    lastName: 'Тестов',
    dateOfBirth: '2018-03-10',
    diagnosis: 'РАС легкой степени',
  },
  child3: {
    firstName: 'Анна',
    lastName: 'Иванова',
    dateOfBirth: '2019-07-22',
  },
}

/**
 * Типы отношений родитель-ребенок
 */
export const relationshipTypes = {
  mother: 'Мать',
  father: 'Отец',
  guardian: 'Опекун',
  other: 'Другое',
}

/**
 * Роли в системе
 */
export const roles = {
  admin: 'Администратор',
  specialist: 'Специалист',
  parent: 'Родитель',
  supervisor: 'Супервизор',
}

/**
 * Статусы пользователей
 */
export const userStatuses = {
  active: 'Активен',
  invited: 'Приглашен',
  suspended: 'Заблокирован',
}

/**
 * Тестовые данные для отчетов
 */
export const testReportData = {
  report1: {
    mood: 'Хорошее',
    duration: 30,
    notes: 'Ребенок с удовольствием выполнил задание',
  },
  report2: {
    mood: 'Отличное',
    duration: 45,
    notes: 'Отличная работа, все цели достигнуты',
  },
  report3: {
    mood: 'Удовлетворительное',
    duration: 20,
    notes: 'Возникли небольшие трудности, но справился',
  },
}

/**
 * Тестовые данные для диагностики
 */
export const testDiagnosticData = {
  cars: {
    questionnaire: 'CARS',
    name: 'Childhood Autism Rating Scale',
  },
  abc: {
    questionnaire: 'ABC',
    name: 'Autism Behavior Checklist',
  },
  atec: {
    questionnaire: 'ATEC',
    name: 'Autism Treatment Evaluation Checklist',
  },
  vineland3: {
    questionnaire: 'Vineland-3',
    name: 'Vineland Adaptive Behavior Scales',
  },
  spm2: {
    questionnaire: 'SPM-2',
    name: 'Sensory Processing Measure',
  },
  mchatr: {
    questionnaire: 'M-CHAT-R',
    name: 'Modified Checklist for Autism in Toddlers',
  },
}

/**
 * Селекторы страниц
 */
export const pageSelectors = {
  dashboard: '/dashboard',
  users: '/dashboard/users',
  children: '/dashboard/children',
  diagnostics: '/dashboard/diagnostics',
  routes: '/dashboard/routes',
  assignments: '/dashboard/assignments',
  exercises: '/dashboard/exercises',
  templates: '/dashboard/templates',
  reports: '/dashboard/reports',
  progress: '/dashboard/progress',
  analytics: '/dashboard/analytics',
  notifications: '/dashboard/notifications',
  profile: '/dashboard/profile',
  settings: '/dashboard/settings',
}

/**
 * API endpoints для ожидания
 */
export const apiEndpoints = {
  users: '/users/v1/users',
  children: '/children/v1/children',
  reports: '/reports/v1',
  analytics: '/analytics/v1',
  notifications: '/notifications/v1',
  diagnostics: '/diagnostics/v1',
  routes: '/routes/v1',
  assignments: '/assignments/v1',
  exercises: '/exercises/v1',
  templates: '/templates/v1',
}

/**
 * Задержки для тестов
 */
export const testTimeouts = {
  short: 1000,    // 1 секунда
  medium: 3000,   // 3 секунды
  long: 5000,     // 5 секунд
  veryLong: 10000, // 10 секунд
}

/**
 * Сообщения об ошибках
 */
export const errorMessages = {
  emailExists: /email.*уже.*использу/i,
  fieldRequired: /обязательн/i,
  invalidEmail: /недопустимый.*email/i,
  passwordMismatch: /пароли.*не.*совпадают/i,
  accessDenied: /доступ.*запрещен/i,
  notFound: /не.*найден/i,
  serverError: /ошибка.*сервер/i,
  lastLegalGuardian: /единственного.*представителя/i,
  invalidDate: /дата.*недопустима/i,
  futureDate: /дата.*будущем/i,
}

/**
 * Успешные сообщения
 */
export const successMessages = {
  created: /создан|добавлен|успешно/i,
  updated: /обновлен|сохранен|успешно/i,
  deleted: /удален|успешно/i,
  invited: /приглашение.*отправлено/i,
  completed: /завершен|выполнен/i,
  saved: /сохранен|успешно/i,
}
