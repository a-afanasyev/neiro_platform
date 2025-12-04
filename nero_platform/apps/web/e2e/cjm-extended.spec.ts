/**
 * E2E тесты для расширенных Customer Journey Map (CJM) сценариев
 * 
 * Этот файл содержит автоматизированные тесты для всех CJM сценариев:
 * - CJM #4: Профильный специалист (логопед/дефектолог/АВА)
 * - CJM #5: Супервизор
 * - CJM #6: Администратор / организация
 * - CJM #7: Ребенок - игровой опыт
 * - CJM #8: Быстрые взаимодействия через Telegram/PWA
 * - CJM #8a: Методист / контент-куратор шаблонов маршрутов
 * - CJM #9-12: Расширенные профессиональные сценарии
 * 
 * Основано на документации из Neiro_CJM_Extended.md
 */

import { test, expect } from '@playwright/test'

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Функция для безопасной очистки storage перед тестом
 */
async function clearStorage(page: any) {
  await page.context().clearCookies()
  
  try {
    await page.goto('/')
  } catch (error) {
    console.warn('Could not navigate to root before clearing localStorage:', error)
  }
  
  try {
    await page.evaluate(() => localStorage.clear())
  } catch (error) {
    console.warn('Could not clear localStorage before test:', error)
  }
}

/**
 * Функция для входа в систему под определенной ролью
 */
async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  
  // Ожидаем редирект на dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

// ============================================
// CJM #4: ПРОФИЛЬНЫЙ СПЕЦИАЛИСТ (ЛОГОПЕД/ДЕФЕКТОЛОГ/АВА)
// ============================================

test.describe('CJM #4: Профильный специалист', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #4.1: Получение назначения - Понять задачу', async ({ page }) => {
    // Вход под профильным специалистом (логопедом)
    await loginAs(page, 'specialist2@example.com', 'admin123')
    
    // Проверка уведомлений о новых назначениях
    await page.click('text=Уведомления')
    await expect(page.locator('text=Новое назначение')).toBeVisible({ timeout: 5000 })
    
    // Переход к панели специалиста
    await page.click('text=Панель специалиста')
    await expect(page).toHaveURL(/\/dashboard\/specialist/)
    
    // Проверка карточки ребенка с целями
    await expect(page.locator('text=Цели ребенка')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Заметки от нейропсихолога')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #4.2: Подготовка к занятию - Спланировать сессию', async ({ page }) => {
    // Вход под профильным специалистом
    await loginAs(page, 'specialist2@example.com', 'admin123')
    
    // Переход в библиотеку упражнений
    await page.click('text=Упражнения')
    await expect(page).toHaveURL(/\/dashboard\/exercises/)
    
    // Поиск упражнений по категории
    await page.selectOption('select[name="category"]', 'Речь')
    
    // Проверка наличия чек-листов и рекомендаций
    await expect(page.locator('text=Рекомендации по адаптации')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Чек-лист для сессии')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #4.3: Проведение занятия - Дать качественный урок', async ({ page }) => {
    // Вход под профильным специалистом
    await loginAs(page, 'specialist2@example.com', 'admin123')
    
    // Переход к расписанию
    await page.click('text=Расписание')
    await expect(page).toHaveURL(/\/dashboard\/schedule/)
    
    // Выбор текущего занятия
    await page.locator('[data-testid="session-card"]').first().click()
    
    // Проверка наличия таймера и кнопок для отметок
    await expect(page.locator('[data-testid="timer"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("Получилось")')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("Сложно")')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #4.4: Отчет - Передать результаты', async ({ page }) => {
    // Вход под профильным специалистом
    await loginAs(page, 'specialist2@example.com', 'admin123')
    
    // Переход к созданию отчета
    await page.click('text=Отчеты')
    await expect(page).toHaveURL(/\/dashboard\/reports/)
    
    // Создание нового отчета
    await page.click('button:has-text("Создать отчет")')
    
    // Проверка наличия шаблонных блоков
    await expect(page.locator('text=Шаблонные блоки')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("Голосовой ввод")')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #4.5: Коммуникация - Согласовать изменения', async ({ page }) => {
    // Вход под профильным специалистом
    await loginAs(page, 'specialist2@example.com', 'admin123')
    
    // Переход в чат
    await page.click('text=Чат')
    await expect(page).toHaveURL(/\/dashboard\/chat/)
    
    // Проверка наличия SLA индикатора
    await expect(page.locator('[data-testid="sla-indicator"]')).toBeVisible({ timeout: 5000 })
    
    // Отправка сообщения с тегом
    await page.fill('[data-testid="message-input"]', 'Вопрос по упражнению')
    await page.selectOption('select[name="tag"]', 'Требует ответа')
    await page.click('button:has-text("Отправить")')
  })

  test('CJM #4.6: Закрытие вех - Отметить контрольную точку', async ({ page }) => {
    // Вход под профильным специалистом
    await loginAs(page, 'specialist2@example.com', 'admin123')
    
    // Переход к вехам
    await page.click('text=Вехи')
    await expect(page).toHaveURL(/\/dashboard\/milestones/)
    
    // Выбор активной вехи
    await page.locator('[data-status="active"]').first().click()
    
    // Проверка чек-листа для закрытия вехи
    await expect(page.locator('text=Чек-лист закрытия вехи')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("Загрузить медиа")')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #4.7: Продление лицензии - Подтвердить квалификацию', async ({ page }) => {
    // Вход под профильным специалистом
    await loginAs(page, 'specialist2@example.com', 'admin123')
    
    // Переход в профиль
    await page.click('text=Профиль')
    await expect(page).toHaveURL(/\/dashboard\/profile/)
    
    // Проверка индикатора срока лицензии
    await expect(page.locator('[data-testid="license-indicator"]')).toBeVisible({ timeout: 5000 })
    
    // Переход к документам
    await page.click('text=Документы')
    await expect(page.locator('text=Чек-лист требований')).toBeVisible({ timeout: 5000 })
  })
})

// ============================================
// CJM #5: СУПЕРВИЗОР
// ============================================

test.describe('CJM #5: Супервизор', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #5.1: Запрос доступа - Просмотреть работу команды', async ({ page }) => {
    // Вход под супервизором
    await loginAs(page, 'supervisor@neiro.dev', 'admin123')
    
    // Проверка фильтров по отклонениям
    await expect(page.locator('select[name="filter"]')).toBeVisible({ timeout: 5000 })
    await page.selectOption('select[name="filter"]', 'Отклонения')
    
    // Проверка предустановленных представлений
    await expect(page.locator('text=Проблемные кейсы')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #5.2: Анализ кейсов - Оценить качество', async ({ page }) => {
    // Вход под супервизором
    await loginAs(page, 'supervisor@neiro.dev', 'admin123')
    
    // Переход к аналитике
    await page.click('text=Аналитика')
    await expect(page).toHaveURL(/\/dashboard\/analytics/)
    
    // Проверка дашбордов с рисками
    await expect(page.locator('text=Дашборд рисков')).toBeVisible({ timeout: 5000 })
    
    // Проверка автоматических колонок отклонений
    await expect(page.locator('text=Отклонения от нормы')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #5.3: Обратная связь - Дать рекомендации', async ({ page }) => {
    // Вход под супервизором
    await loginAs(page, 'supervisor@neiro.dev', 'admin123')
    
    // Переход к кейсу
    await page.locator('[data-testid="case-card"]').first().click()
    
    // Проверка шаблонов комментариев
    await expect(page.locator('text=Шаблоны комментариев')).toBeVisible({ timeout: 5000 })
    
    // Добавление комментария с тегом
    await page.fill('[data-testid="comment-input"]', 'Рекомендация по коррекции')
    await page.selectOption('select[name="tag"]', 'Требует ответа')
    await page.click('button:has-text("Добавить комментарий")')
  })

  test('CJM #5.4: Контроль вех - Проверить закрытие контрольных точек', async ({ page }) => {
    // Вход под супервизором
    await loginAs(page, 'supervisor@neiro.dev', 'admin123')
    
    // Переход к дашборду вех
    await page.click('text=Вехи')
    await expect(page).toHaveURL(/\/dashboard\/milestones/)
    
    // Проверка статусов вех
    await expect(page.locator('text=Вехи в риске')).toBeVisible({ timeout: 5000 })
    
    // Просмотр деталей вехи
    await page.locator('[data-testid="milestone-card"]').first().click()
    await expect(page.locator('text=Просмотр прикреплений')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("Вернуть на доработку")')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #5.5: Контроль качества - Следить за улучшениями', async ({ page }) => {
    // Вход под супервизором
    await loginAs(page, 'supervisor@neiro.dev', 'admin123')
    
    // Переход к отчетам
    await page.click('text=Отчеты')
    await expect(page).toHaveURL(/\/dashboard\/reports/)
    
    // Проверка чек-листов
    await expect(page.locator('text=Чек-листы')).toBeVisible({ timeout: 5000 })
    
    // Проверка статусов задач
    await expect(page.locator('text=Статусы задач')).toBeVisible({ timeout: 5000 })
    
    // Проверка журнала действий
    await expect(page.locator('text=Журнал действий')).toBeVisible({ timeout: 5000 })
  })
})

// ============================================
// CJM #6: АДМИНИСТРАТОР / ОРГАНИЗАЦИЯ
// ============================================

test.describe('CJM #6: Администратор / организация', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #6.1: Ознакомление с системой - Оценить решение для центра', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Проверка наличия кейсов внедрения
    await expect(page.locator('text=Кейсы внедрения')).toBeVisible({ timeout: 5000 })
    
    // Проверка демонстрации безопасности
    await expect(page.locator('text=Безопасность данных')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=FAQ')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.2: Подключение организации - Запустить работу центра', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к настройкам организации
    await page.click('text=Организация')
    await expect(page).toHaveURL(/\/dashboard\/organization/)
    
    // Проверка мастера внедрения
    await expect(page.locator('text=Мастер внедрения')).toBeVisible({ timeout: 5000 })
    
    // Проверка шаблона настроек
    await expect(page.locator('text=Шаблон настроек')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.3: Пилот - Проверить эффективность', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к пилотному дашборду
    await page.click('text=Пилот')
    await expect(page).toHaveURL(/\/dashboard\/pilot/)
    
    // Проверка пилотного дашборда
    await expect(page.locator('text=Пилотный дашборд')).toBeVisible({ timeout: 5000 })
    
    // Проверка чек-листов аудита
    await expect(page.locator('text=Чек-листы аудита')).toBeVisible({ timeout: 5000 })
    
    // Проверка автоматического отчета пилота
    await expect(page.locator('text=Отчет пилота')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.4: Онбординг персонала - Добавить сотрудников', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к управлению персоналом
    await page.click('text=Персонал')
    await expect(page).toHaveURL(/\/dashboard\/staff/)
    
    // Создание новой учетной записи
    await page.click('button:has-text("Добавить сотрудника")')
    
    // Проверка ролевых шаблонов
    await expect(page.locator('text=Ролевые шаблоны')).toBeVisible({ timeout: 5000 })
    
    // Проверка импорта из CSV
    await expect(page.locator('button:has-text("Импорт из CSV")')).toBeVisible({ timeout: 5000 })
    
    // Проверка двойного подтверждения
    await expect(page.locator('text=Подтвердите создание')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.5: Управление квалификациями - Продлить лицензии специалистов', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к квалификациям
    await page.click('text=Квалификации')
    await expect(page).toHaveURL(/\/dashboard\/qualifications/)
    
    // Проверка панели соответствия
    await expect(page.locator('text=Панель соответствия')).toBeVisible({ timeout: 5000 })
    
    // Проверка календаря напоминаний
    await expect(page.locator('text=Напоминания о лицензиях')).toBeVisible({ timeout: 5000 })
    
    // Проверка автонапоминаний
    await expect(page.locator('text=Напоминания за 30/7 дней')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.6: Масштабирование - Расширить использование', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к филиалам
    await page.click('text=Филиалы')
    await expect(page).toHaveURL(/\/dashboard\/branches/)
    
    // Проверка профилей филиалов
    await expect(page.locator('text=Профили филиалов')).toBeVisible({ timeout: 5000 })
    
    // Проверка мониторинга SLA
    await expect(page.locator('text=Мониторинг SLA')).toBeVisible({ timeout: 5000 })
    
    // Проверка синхронизации с HR
    await expect(page.locator('text=Синхронизация с HR')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.7: Настройка соответствия - Соблюсти стандарты', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к настройкам безопасности
    await page.click('text=Безопасность')
    await expect(page).toHaveURL(/\/dashboard\/security/)
    
    // Проверка чек-листов 152-ФЗ/GDPR/HIPAA
    await expect(page.locator('text=152-ФЗ')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=GDPR')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=HIPAA')).toBeVisible({ timeout: 5000 })
    
    // Проверка журнала согласий
    await expect(page.locator('text=Журнал согласий')).toBeVisible({ timeout: 5000 })
    
    // Проверка напоминаний о ревизиях
    await expect(page.locator('text=Напоминания о ревизиях')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.8: Мониторинг процессов - Отслеживать KPI', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к KPI
    await page.click('text=KPI')
    await expect(page).toHaveURL(/\/dashboard\/kpi/)
    
    // Проверка дашборда организации
    await expect(page.locator('text=Дашборд организации')).toBeVisible({ timeout: 5000 })
    
    // Проверка API для BI
    await expect(page.locator('text=API для BI')).toBeVisible({ timeout: 5000 })
    
    // Проверка расписания отчетов
    await expect(page.locator('text=Расписание отчетов')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.9: Аудит контрольных точек - Убедиться в соблюдении маршрутов', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к аудиту
    await page.click('text=Аудит')
    await expect(page).toHaveURL(/\/dashboard\/audit/)
    
    // Проверка отчетов по вехам
    await expect(page.locator('text=Отчеты по вехам')).toBeVisible({ timeout: 5000 })
    
    // Проверка фильтра по специалистам
    await expect(page.locator('text=Фильтр по специалистам')).toBeVisible({ timeout: 5000 })
    
    // Проверка лога "кто закрыл"
    await expect(page.locator('text=Лог закрытия')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #6.10: Поддержка - Решить инцидент', async ({ page }) => {
    // Вход под администратором
    await loginAs(page, 'admin1@example.com', 'admin123')
    
    // Переход к поддержке
    await page.click('text=Поддержка')
    await expect(page).toHaveURL(/\/dashboard\/support/)
    
    // Проверка SLA по заявкам
    await expect(page.locator('text=SLA по заявкам')).toBeVisible({ timeout: 5000 })
    
    // Проверка базы знаний
    await expect(page.locator('text=База знаний')).toBeVisible({ timeout: 5000 })
    
    // Проверка AI-помощника
    await expect(page.locator('text=AI-помощник')).toBeVisible({ timeout: 5000 })
  })
})

// ============================================
// CJM #7: РЕБЕНОК - ИГРОВОЙ ОПЫТ
// ============================================

test.describe('CJM #7: Ребенок - Игровой опыт', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #7.1: Знакомство - Принять задание', async ({ page }) => {
    // Вход под родителем для доступа к детскому интерфейсу
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к детскому режиму
    await page.click('text=Детский режим')
    
    // Проверка персонажа
    await expect(page.locator('[data-testid="character"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка простой инструкции
    await expect(page.locator('text=Простая инструкция')).toBeVisible({ timeout: 5000 })
    
    // Проверка визуальных подсказок
    await expect(page.locator('[data-testid="visual-hint"]')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #7.2: Выполнение - Делать упражнение', async ({ page }) => {
    // Вход под родителем для доступа к детскому интерфейсу
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к детскому режиму
    await page.click('text=Детский режим')
    
    // Запуск упражнения
    await page.click('button:has-text("Начать упражнение")')
    
    // Проверка таймера с паузами
    await expect(page.locator('[data-testid="timer-with-pause"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка звукового подкрепления
    await expect(page.locator('button:has-text("Звук")')).toBeVisible({ timeout: 5000 })
    
    // Проверка адаптации по уровню
    await expect(page.locator('text=Уровень сложности')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #7.3: Поддержка - Сохранять внимание', async ({ page }) => {
    // Вход под родителем для доступа к детскому интерфейсу
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к детскому режиму
    await page.click('text=Детский режим')
    
    // Запуск упражнения
    await page.click('button:has-text("Начать упражнение")')
    
    // Проверка микро-наград
    await expect(page.locator('[data-testid="micro-reward"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка смены активности
    await expect(page.locator('text=Смена активности')).toBeVisible({ timeout: 5000 })
    
    // Проверка таймера "осталось X"
    await expect(page.locator('[data-testid="time-remaining"]')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #7.4: Завершение - Почувствовать успех', async ({ page }) => {
    // Вход под родителем для доступа к детскому интерфейсу
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к детскому режиму
    await page.click('text=Детский режим')
    
    // Завершение упражнения
    await page.click('button:has-text("Завершить")')
    
    // Проверка виртуальных наград
    await expect(page.locator('[data-testid="virtual-reward"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка возможности поделиться успехом
    await expect(page.locator('button:has-text("Поделиться")')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #7.5: Вознаграждение - Закрепить мотивацию', async ({ page }) => {
    // Вход под родителем для доступа к детскому интерфейсу
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к детскому режиму
    await page.click('text=Детский режим')
    
    // Переход к наградам
    await page.click('text=Награды')
    
    // Проверка коллекции наград
    await expect(page.locator('[data-testid="reward-collection"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка предложения следующего задания
    await expect(page.locator('text=Следующее задание')).toBeVisible({ timeout: 5000 })
    
    // Проверка напоминания о наградах
    await expect(page.locator('text=Ваши награды')).toBeVisible({ timeout: 5000 })
  })
})

// ============================================
// CJM #8: БЫСТРЫЕ ВЗАИМОДЕЙСТВИЯ ЧЕРЕЗ TELEGRAM/PWA
// ============================================

test.describe('CJM #8: Telegram/PWA взаимодействия', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #8.1: Уведомление - Не пропустить задание', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к настройкам уведомлений
    await page.click('text=Настройки')
    await page.click('text=Уведомления')
    
    // Проверка дублирования каналов
    await expect(page.locator('text=Дублирование каналов')).toBeVisible({ timeout: 5000 })
    
    // Проверка настройки времени отправки
    await expect(page.locator('text=Время отправки')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #8.2: Быстрый отчет - Сдать задание "на бегу"', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к PWA режиму
    await page.click('text=PWA режим')
    
    // Проверка мини-приложения
    await expect(page.locator('[data-testid="mini-app"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка выбора смайлов
    await expect(page.locator('[data-testid="emoji-selector"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка прикрепления фото
    await expect(page.locator('button:has-text("Прикрепить фото")')).toBeVisible({ timeout: 5000 })
    
    // Проверка компрессии
    await expect(page.locator('text=Автосжатие')).toBeVisible({ timeout: 5000 })
    
    // Проверка автосохранения черновика
    await expect(page.locator('text=Автосохранение')).toBeVisible({ timeout: 5000 })
    
    // Проверка офлайн отправки
    await expect(page.locator('text=Офлайн отправка')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #8.3: Напоминание - Помнить о встрече', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к календарю
    await page.click('text=Календарь')
    
    // Проверка карточки события
    await expect(page.locator('[data-testid="event-card"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка подтверждения участия
    await expect(page.locator('button:has-text("Подтвердить участие")')).toBeVisible({ timeout: 5000 })
    
    // Проверка кнопки "Перенести"
    await expect(page.locator('button:has-text("Перенести")')).toBeVisible({ timeout: 5000 })
    
    // Проверка синхронизации с календарем
    await expect(page.locator('text=Синхронизация с календарем')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #8.4: Служба поддержки - Быстро получить ответ', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к поддержке
    await page.click('text=Поддержка')
    
    // Проверка вопроса в бот
    await expect(page.locator('[data-testid="bot-question"]')).toBeVisible({ timeout: 5000 })
    
    // Проверка переключения на специалиста
    await expect(page.locator('button:has-text("Переключить на специалиста")')).toBeVisible({ timeout: 5000 })
    
    // Проверка AI-подсказок
    await expect(page.locator('text=AI-подсказки')).toBeVisible({ timeout: 5000 })
    
    // Проверка эскалации в живой чат
    await expect(page.locator('button:has-text("Живой чат")')).toBeVisible({ timeout: 5000 })
    
    // Проверка SLA индикатора
    await expect(page.locator('[data-testid="sla-indicator"]')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #8.5: Автоматические ответы - Чувствовать заботу', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'parent123')
    
    // Переход к настройкам автоответов
    await page.click('text=Настройки')
    await page.click('text=Автоответы')
    
    // Проверка шаблонных автоответов
    await expect(page.locator('text=Шаблоны автоответов')).toBeVisible({ timeout: 5000 })
    
    // Проверка кнопки "Запросить звонок"
    await expect(page.locator('button:has-text("Запросить звонок")')).toBeVisible({ timeout: 5000 })
  })
})

// ============================================
// CJM #8a: МЕТОДИСТ / КОНТЕНТ-КУРАТОР ШАБЛОНОВ МАРШРУТОВ
// ============================================

test.describe('CJM #8a: Методист / контент-куратор', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #8a.1: Анализ потребностей - Определить, какой шаблон нужен', async ({ page }) => {
    // Вход под методистом
    await loginAs(page, 'methodist1@example.com', 'admin123')
    
    // Переход к аналитике
    await page.click('text=Аналитика')
    
    // Проверка отчетов "топ сценариев"
    await expect(page.locator('text=Топ сценариев')).toBeVisible({ timeout: 5000 })
    
    // Проверка рейтинга упражнений
    await expect(page.locator('text=Рейтинг упражнений')).toBeVisible({ timeout: 5000 })
    
    // Проверка сбора фидбека
    await expect(page.locator('text=Сбор обратной связи')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #8a.2: Создание черновика - Сформировать базовый шаблон', async ({ page }) => {
    // Вход под методистом
    await loginAs(page, 'methodist1@example.com', 'admin123')
    
    // Переход к конструктору шаблонов
    await page.click('text=Конструктор шаблонов')
    
    // Создание нового шаблона
    await page.click('button:has-text("Создать шаблон")')
    
    // Проверка библиотеки модулей
    await expect(page.locator('text=Библиотека модулей')).toBeVisible({ timeout: 5000 })
    
    // Проверка подсказок по возрасту/диагнозу
    await expect(page.locator('text=Подсказки по возрасту')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Подсказки по диагнозу')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #8a.3: Рецензирование - Получить подтверждение качества', async ({ page }) => {
    // Вход под методистом
    await loginAs(page, 'methodist1@example.com', 'admin123')
    
    // Переход к шаблонам
    await page.click('text=Шаблоны')
    
    // Открытие черновика для рецензирования
    await page.locator('[data-status="draft"]').first().click()
    
    // Проверка совместного редактирования
    await expect(page.locator('text=Совместное редактирование')).toBeVisible({ timeout: 5000 })
    
    // Проверка комментариев
    await expect(page.locator('text=Комментарии')).toBeVisible({ timeout: 5000 })
    
    // Проверка истории версий
    await expect(page.locator('text=История версий')).toBeVisible({ timeout: 5000 })
    
    // Проверка чек-листа согласования
    await expect(page.locator('text=Чек-лист согласования')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #8a.4: Публикация - Сделать шаблон доступным команде', async ({ page }) => {
    // Вход под методистом
    await loginAs(page, 'methodist1@example.com', 'admin123')
    
    // Переход к шаблонам
    await page.click('text=Шаблоны')
    
    // Открытие шаблона для публикации
    await page.locator('[data-status="draft"]').first().click()
    
    // Публикация шаблона
    await page.click('button:has-text("Опубликовать")')
    
    // Проверка авто-проверок
    await expect(page.locator('text=Авто-проверки')).toBeVisible({ timeout: 5000 })
    
    // Проверка подписи ответственного
    await expect(page.locator('text=Подпись ответственного')).toBeVisible({ timeout: 5000 })
    
    // Проверка статусов draft/published
    await expect(page.locator('text=Статус: Published')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #8a.5: Актуализация - Обновить по данным эффективности', async ({ page }) => {
    // Вход под методистом
    await loginAs(page, 'methodist1@example.com', 'admin123')
    
    // Переход к дашборду эффективности
    await page.click('text=Эффективность')
    
    // Проверка KPI шаблона
    await expect(page.locator('text=KPI шаблона')).toBeVisible({ timeout: 5000 })
    
    // Обновление шаблона
    await page.click('text=Обновить шаблон')
    
    // Проверка событий template.updated
    await expect(page.locator('text=template.updated')).toBeVisible({ timeout: 5000 })
    
    // Проверка сравнения версий
    await expect(page.locator('text=Сравнение версий')).toBeVisible({ timeout: 5000 })
    
    // Проверка уведомлений о миграции маршрутов
    await expect(page.locator('text=Уведомления о миграции')).toBeVisible({ timeout: 5000 })
  })
})

// ============================================
// CJM #9-12: РАСШИРЕННЫЕ ПРОФЕССИОНАЛЬНЫЕ СЦЕНАРИИ
// ============================================

test.describe('CJM #9-12: Расширенные профессиональные сценарии', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #9: Диагностический процесс (специалист)', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')
    
    // Переход к диагностике
    await page.click('text=Диагностика')
    
    // Проверка шаблонов диагностических сценариев
    await expect(page.locator('text=Шаблоны сценариев')).toBeVisible({ timeout: 5000 })
    
    // Проверка рекомендаций по возрасту
    await expect(page.locator('text=Рекомендации по возрасту')).toBeVisible({ timeout: 5000 })
    
    // Создание диагностической сессии
    await page.click('button:has-text("Создать сессию")')
    
    // Проверка адаптивного интерфейса
    await expect(page.locator('text=Адаптивный интерфейс')).toBeVisible({ timeout: 5000 })
    
    // Проверка пауз
    await expect(page.locator('text=Паузы')).toBeVisible({ timeout: 5000 })
    
    // Проверка подсказок по поведению
    await expect(page.locator('text=Подсказки по поведению')).toBeVisible({ timeout: 5000 })
    
    // Проверка единого репозитория
    await expect(page.locator('text=Единый репозиторий')).toBeVisible({ timeout: 5000 })
    
    // Проверка автоматического таймлайна
    await expect(page.locator('text=Автоматический таймлайн')).toBeVisible({ timeout: 5000 })
    
    // Проверка автоанализа
    await expect(page.locator('text=Автоанализ')).toBeVisible({ timeout: 5000 })
    
    // Проверка визуализации профиля навыков
    await expect(page.locator('text=Профиль навыков')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #10: Пост-диагностика и формирование маршрута', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')
    
    // Переход к отчетам
    await page.click('text=Отчеты')
    
    // Просмотр отчета
    await page.locator('[data-testid="report-card"]').first().click()
    
    // Проверка автоматической расшифровки
    await expect(page.locator('text=Автоматическая расшифровка')).toBeVisible({ timeout: 5000 })
    
    // Проверка TL;DR блока
    await expect(page.locator('text=Краткое содержание')).toBeVisible({ timeout: 5000 })
    
    // Создание маршрута
    await page.click('button:has-text("Создать маршрут")')
    
    // Проверка шаблонных маршрутов
    await expect(page.locator('text=Шаблонные маршруты')).toBeVisible({ timeout: 5000 })
    
    // Проверка рекомендаций по целям
    await expect(page.locator('text=Рекомендации по целям')).toBeVisible({ timeout: 5000 })
    
    // Проверка упрощенного формата показа
    await expect(page.locator('text=Упрощенный формат')).toBeVisible({ timeout: 5000 })
    
    // Проверка сравнения "до/после"
    await expect(page.locator('text=Сравнение до/после')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #11: Обратная связь и оценка результатов', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')
    
    // Переход к диагностике
    await page.click('text=Диагностика')
    
    // Создание повторной диагностики
    await page.click('button:has-text("Повторная диагностика")')
    
    // Проверка динамических отчетов
    await expect(page.locator('text=Динамические отчеты')).toBeVisible({ timeout: 5000 })
    
    // Проверка автонапоминаний
    await expect(page.locator('text=Автонапоминания')).toBeVisible({ timeout: 5000 })
    
    // Обсуждение результатов
    await page.click('text=Обсудить результаты')
    
    // Проверка видео/чата
    await expect(page.locator('text=Видеочат')).toBeVisible({ timeout: 5000 })
    
    // Проверка отчета
    await expect(page.locator('text=Отчет')).toBeVisible({ timeout: 5000 })
    
    // Проверка автоматического сравнения
    await expect(page.locator('text=Автоматическое сравнение')).toBeVisible({ timeout: 5000 })
    
    // Проверка шаблонов комментариев
    await expect(page.locator('text=Шаблоны комментариев')).toBeVisible({ timeout: 5000 })
    
    // Коррекция плана
    await page.click('text=Скорректировать план')
    
    // Проверка конструктора маршрутов
    await expect(page.locator('text=Конструктор маршрутов')).toBeVisible({ timeout: 5000 })
    
    // Проверка истории изменений
    await expect(page.locator('text=История изменений')).toBeVisible({ timeout: 5000 })
    
    // Проверка рекомендаций по адаптациям
    await expect(page.locator('text=Рекомендации по адаптациям')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #12: Поддержка и обучение пользователей', async ({ page }) => {
    // Вход под новым пользователем
    await loginAs(page, 'newuser@example.com', 'password123')
    
    // Проверка онбординга
    await expect(page.locator('text=Первые 5 шагов')).toBeVisible({ timeout: 5000 })
    
    // Проверка чек-листов
    await expect(page.locator('text=Чек-листы')).toBeVisible({ timeout: 5000 })
    
    // Переход к базе знаний
    await page.click('text=База знаний')
    
    // Проверка видео
    await expect(page.locator('text=Видео')).toBeVisible({ timeout: 5000 })
    
    // Проверка Telegram
    await expect(page.locator('text=Telegram')).toBeVisible({ timeout: 5000 })
    
    // Решение проблем
    await page.click('text=Помощь')
    
    // Проверка подсказок
    await expect(page.locator('text=Подсказки')).toBeVisible({ timeout: 5000 })
    
    // Проверка эскалации
    await expect(page.locator('text=Эскалация к оператору')).toBeVisible({ timeout: 5000 })
    
    // Проверка SLA
    await expect(page.locator('text=SLA')).toBeVisible({ timeout: 5000 })
    
    // Обучение
    await page.click('text=Обучение')
    
    // Проверка вебинаров
    await expect(page.locator('text=Вебинары')).toBeVisible({ timeout: 5000 })
    
    // Проверка базы знаний
    await expect(page.locator('text=База знаний')).toBeVisible({ timeout: 5000 })
    
    // Проверка сертификации
    await expect(page.locator('text=Сертификация')).toBeVisible({ timeout: 5000 })
    
    // Проверка геймификации
    await expect(page.locator('text=Геймификация')).toBeVisible({ timeout: 5000 })
  })
})

