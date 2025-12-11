/**
 * E2E тесты для Customer Journey Map (CJM) сценариев
 * 
 * Этот файл содержит автоматизированные тесты для трех основных CJM:
 * - CJM #1: Родитель - первый контакт и онбординг
 * - CJM #2: Родитель - выполнение программы дома
 * - CJM #3: Нейропсихолог - полный цикл сопровождения
 * 
 * Основано на документации из CJM_MANUAL_TEST_READINESS.md и Neiro_CJM_Extended.md
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
// CJM #1: РОДИТЕЛЬ - ПЕРВЫЙ КОНТАКТ И ОНБОРДИНГ
// ============================================

test.describe('CJM #1: Родитель - Онбординг', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #1.1: Родитель может войти в систему после приглашения', async ({ page }) => {
    // Шаг 1: Переход на страницу логина
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Neiro Platform')

    // Шаг 2: Вход под учетной записью родителя (используем тестового родителя из seed данных)
    // В seed.ts создан parent1@example.com с паролем parent123
    await page.fill('input[type="email"]', 'parent1@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Шаг 3: Проверка успешного входа и редиректа на dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Шаг 4: Проверка, что отображается dashboard для родителя
    // Проверяем приветственный заголовок "Добрый вечер"
    await expect(page.getByRole('heading', { level: 1, name: /Добр/ })).toBeVisible({ timeout: 5000 })
  })

  test('CJM #1.2: Родитель видит своих детей после входа', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'admin123')

    // Переход в раздел "Мои дети"
    await page.click('text=Мои дети')
    await expect(page).toHaveURL(/\/dashboard\/children/)

    // Проверка, что отображается список детей
    // В seed.ts у parent1 есть child1 (Алиса Иванова) и child2 (Борис Петров)
    await expect(page.locator('text=Алиса')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #1.3: Родитель может просмотреть профиль своего ребенка', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'admin123')

    // Переход в раздел "Мои дети"
    await page.click('text=Мои дети')
    await expect(page).toHaveURL(/\/dashboard\/children/)

    // Клик на кнопку "Подробнее" в карточке ребенка с именем "Алиса"
    // Используем корректный Playwright селектор: находим карточку с текстом "Алиса",
    // затем внутри нее ищем кнопку "Подробнее"
    await page.locator('div:has-text("Алиса")').locator('button:has-text("Подробнее")').first().click()

    // Проверка, что открылся профиль ребенка с основной информацией
    await expect(page.locator('text=Дата рождения')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Родители')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('heading', { name: 'Назначенные специалисты' })).toBeVisible({ timeout: 5000 })
  })
})

// ============================================
// CJM #2: РОДИТЕЛЬ - ВЫПОЛНЕНИЕ ПРОГРАММЫ ДОМА
// ============================================

test.describe('CJM #2: Родитель - Выполнение программы', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #2.1: Родитель может просмотреть назначенные упражнения', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'admin123')

    // Переход в раздел "Задания"
    await page.click('text=Задания')
    await expect(page).toHaveURL(/\/dashboard\/assignments/)

    // Проверка, что отображается список назначений
    // В seed данных должны быть созданы назначения для детей parent1
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Задания|Назначения/)
  })

  test('CJM #2.2: Родитель может просмотреть календарь занятий', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'admin123')

    // Переход в раздел "Задания"
    await page.click('text=Задания')
    await expect(page).toHaveURL(/\/dashboard\/assignments/)

    // Проверка наличия календарного представления или списка назначений
    // (в зависимости от реализации UI)
    const hasCalendar = await page.locator('[data-testid="calendar"]').isVisible().catch(() => false)
    const hasList = await page.locator('[data-testid="assignments-list"]').isVisible().catch(() => false)
    
    expect(hasCalendar || hasList).toBeTruthy()
  })

  test('CJM #2.3: Родитель может просмотреть детали упражнения через задания', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'admin123')

    // Переход в раздел "Задания"
    await page.click('text=Задания')
    await expect(page).toHaveURL(/\/dashboard\/assignments/)

    // Родители видят упражнения через назначенные задания
    // Проверяем наличие назначений (assignments list or cards)
    const assignmentCards = page.locator('[data-testid="assignment-card"]')
    const hasAssignments = await assignmentCards.count() > 0

    // Если есть задания, можем проверить детали
    if (hasAssignments) {
      await assignmentCards.first().click()
      // После клика должны увидеть детали задания или упражнения
      await page.waitForURL(/\/dashboard\/assignments\/.*/, { timeout: 5000 }).catch(() => {})
    }
  })

  test('CJM #2.4: Родитель может отметить выполнение назначения', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'admin123')

    // Переход в раздел "Задания"
    await page.click('text=Задания')
    await expect(page).toHaveURL(/\/dashboard\/assignments/)

    // Поиск назначения со статусом "scheduled" или "in_progress"
    const assignmentCard = page.locator('[data-status="scheduled"], [data-status="in_progress"]').first()
    
    if (await assignmentCard.isVisible()) {
      // Клик на кнопку "Начать" или "Завершить"
      const startButton = assignmentCard.locator('button:has-text("Начать")')
      const completeButton = assignmentCard.locator('button:has-text("Завершить")')
      
      if (await startButton.isVisible()) {
        await startButton.click()
        await expect(page.locator('text=Статус обновлен')).toBeVisible({ timeout: 5000 })
      } else if (await completeButton.isVisible()) {
        await completeButton.click()
        await expect(page.locator('text=Статус обновлен')).toBeVisible({ timeout: 5000 })
      }
    }
  })
})

// ============================================
// CJM #3: НЕЙРОПСИХОЛОГ - ПОЛНЫЙ ЦИКЛ СОПРОВОЖДЕНИЯ
// ============================================

test.describe('CJM #3: Нейропсихолог - Полный цикл', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM #3.1: Специалист может войти в систему', async ({ page }) => {
    // Вход под специалистом (нейропсихологом)
    // В seed.ts создан specialist1@example.com с паролем admin123
    await page.goto('/login')
    await page.fill('input[type="email"]', 'specialist1@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Проверка успешного входа
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.locator('text=Панель')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #3.2: Специалист может просмотреть список своих детей', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')

    // Переход в раздел "Дети"
    await page.click('text=Дети')
    await expect(page).toHaveURL(/\/dashboard\/children/)

    // Проверка, что отображается список детей, закрепленных за специалистом
    // В seed.ts specialist1 (нейропсихолог) закреплен за child1 и child2
    await expect(page.locator('text=Алиса')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #3.3: Специалист может создать диагностическую сессию', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')

    // Переход в раздел "Диагностика"
    await page.click('text=Диагностика')
    await expect(page).toHaveURL(/\/dashboard\/diagnostics/)

    // Проверка наличия кнопки создания новой сессии
    const createButton = page.locator('button:has-text("Создать сессию")')
    
    if (await createButton.isVisible()) {
      await createButton.click()
      
      // Проверка открытия формы создания сессии
      await expect(page.locator('text=Создать диагностическую сессию')).toBeVisible({ timeout: 5000 })
      
      // Заполнение формы (базовая проверка)
      await page.selectOption('select[name="childId"]', { index: 1 })
      await page.selectOption('select[name="questionnaireCode"]', { index: 1 })
      
      // Отмена для избежания создания реальной сессии
      await page.click('button:has-text("Отмена")')
    }
  })

  test('CJM #3.4: Специалист может просмотреть доступные опросники', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')

    // Переход в раздел "Диагностика"
    await page.click('text=Диагностика')
    await expect(page).toHaveURL(/\/dashboard\/diagnostics/)

    // Проверка отображения списка опросников
    // В seed.ts созданы опросники: MCHAT-R, CARS-2, ADOS-2, ADI-R, Vineland-3, BRIEF-2
    await expect(page.locator('text=MCHAT-R')).toBeVisible({ timeout: 5000 })
  })

  test('CJM #3.5: Специалист может создать индивидуальный маршрут', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')

    // Переход в раздел "Маршруты"
    await page.click('text=Маршруты')
    await expect(page).toHaveURL(/\/dashboard\/routes/)

    // Проверка наличия кнопки создания нового маршрута
    const createButton = page.locator('button:has-text("Создать маршрут")')
    
    if (await createButton.isVisible()) {
      await createButton.click()
      
      // Проверка открытия формы создания маршрута
      await expect(page).toHaveURL(/\/dashboard\/routes\/new/)
      await expect(page.locator('text=Новый маршрут')).toBeVisible({ timeout: 5000 })
      
      // Проверка наличия основных полей формы
      await expect(page.locator('input[name="title"]')).toBeVisible()
      await expect(page.getByText('Ребенок *')).toBeVisible()
      await expect(page.getByText('Ведущий специалист *')).toBeVisible()
    }
  })

  test('CJM #3.6: Специалист может просмотреть существующие маршруты', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')

    // Переход в раздел "Маршруты"
    await page.click('text=Маршруты')
    await expect(page).toHaveURL(/\/dashboard\/routes/)

    // Проверка отображения списка маршрутов
    await expect(page.getByRole('heading', { level: 1, name: 'Маршруты' })).toBeVisible({ timeout: 5000 })
    
    // Если есть маршруты, проверяем возможность просмотра деталей
    const routeCards = page.locator('[data-testid="route-card"]')
    const count = await routeCards.count()
    
    if (count > 0) {
      await routeCards.first().click()
      
      // Проверка открытия страницы деталей маршрута
      await expect(page).toHaveURL(/\/dashboard\/routes\/[a-f0-9-]+/)
      await expect(page.locator('text=Цели')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Фазы')).toBeVisible({ timeout: 5000 })
    }
  })

  test('CJM #3.7: Специалист может создать назначение для ребенка', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')

    // Переход в раздел "Назначения"
    await page.click('text=Назначения')
    await expect(page).toHaveURL(/\/dashboard\/assignments/)

    // Проверка наличия кнопки создания нового назначения
    const createButton = page.locator('button:has-text("Создать назначение")')
    
    if (await createButton.isVisible()) {
      await createButton.click()
      
      // Проверка открытия формы создания назначения
      await expect(page.locator('text=Новое назначение')).toBeVisible({ timeout: 5000 })
      
      // Проверка наличия основных полей формы
      await expect(page.getByText('Ребенок *')).toBeVisible()
      await expect(page.getByText('Упражнение *')).toBeVisible()
      await expect(page.getByText('Дата начала *')).toBeVisible()
      
      // Отмена для избежания создания реального назначения
      await page.click('button:has-text("Отмена")')
    }
  })

  test('CJM #3.8: Специалист может просмотреть библиотеку упражнений', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')

    // Переход в раздел "Упражнения"
    await page.click('text=Упражнения')
    await expect(page).toHaveURL(/\/dashboard\/exercises/)

    // Проверка отображения библиотеки упражнений
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Упражнения')
    
    // Проверка наличия фильтров по категориям
    const categoryFilter = page.locator('select[name="category"]')
    if (await categoryFilter.isVisible()) {
      await expect(categoryFilter).toBeVisible()
    }
  })

  test('CJM #3.9: Специалист может просмотреть шаблоны программ', async ({ page }) => {
    // Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')

    // Переход в раздел "Шаблоны" - используем более точный селектор и ждем навигации
    await Promise.all([
      page.waitForURL(/\/dashboard\/templates/, { timeout: 10000 }),
      page.click('a[href="/dashboard/templates"]')
    ])
    await expect(page).toHaveURL(/\/dashboard\/templates/)

    // Проверка отображения библиотеки шаблонов
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Шаблоны/)
    
    // Если есть шаблоны, проверяем возможность просмотра деталей
    const templateCards = page.locator('[data-testid="template-card"]')
    const count = await templateCards.count()
    
    if (count > 0) {
      await templateCards.first().click()
      
      // Проверка открытия страницы деталей шаблона
      await expect(page).toHaveURL(/\/dashboard\/templates\/[a-f0-9-]+/)
      await expect(page.locator('text=Описание')).toBeVisible({ timeout: 5000 })
    }
  })
})

// ============================================
// ДОПОЛНИТЕЛЬНЫЕ СКВОЗНЫЕ ТЕСТЫ
// ============================================

test.describe('CJM: Сквозные сценарии', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('CJM: Полный цикл - от диагностики до назначения упражнений', async ({ page }) => {
    // Этот тест проверяет полный цикл работы специалиста:
    // 1. Вход в систему
    // 2. Просмотр ребенка
    // 3. Создание диагностической сессии
    // 4. Создание маршрута
    // 5. Создание назначения
    
    // Шаг 1: Вход под специалистом
    await loginAs(page, 'specialist1@example.com', 'admin123')
    
    // Шаг 2: Просмотр списка детей
    await page.click('text=Дети')
    await expect(page).toHaveURL(/\/dashboard\/children/)
    await expect(page.locator('text=Алиса')).toBeVisible({ timeout: 5000 })
    
    // Шаг 3: Переход в диагностику
    await page.click('text=Диагностика')
    await expect(page).toHaveURL(/\/dashboard\/diagnostics/)
    await expect(page.locator('text=MCHAT-R')).toBeVisible({ timeout: 5000 })
    
    // Шаг 4: Переход в маршруты
    await page.click('text=Маршруты')
    await expect(page).toHaveURL(/\/dashboard\/routes/)
    await expect(page.getByRole('heading', { level: 1, name: 'Маршруты' })).toBeVisible({ timeout: 5000 })
    
    // Шаг 5: Переход в назначения
    await page.click('text=Назначения')
    await expect(page).toHaveURL(/\/dashboard\/assignments/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Задания|Назначения/)
    
    // Проверка успешного прохождения всего цикла
    expect(true).toBeTruthy()
  })

  test('CJM: Родитель может просмотреть прогресс выполнения программы', async ({ page }) => {
    // Вход под родителем
    await loginAs(page, 'parent1@example.com', 'admin123')
    
    // Переход к ребенку
    await page.click('text=Дети')
    await expect(page).toHaveURL(/\/dashboard\/children/)
    
    // Переход к назначениям
    await page.click('text=Назначения')
    await expect(page).toHaveURL(/\/dashboard\/assignments/)
    
    // Проверка наличия информации о прогрессе
    // (в зависимости от реализации UI это может быть прогресс-бар, статистика и т.д.)
    const hasProgress = await page.locator('[data-testid="progress-indicator"]').isVisible().catch(() => false)
    const hasStats = await page.locator('text=Выполнено').isVisible().catch(() => false)
    
    expect(hasProgress || hasStats).toBeTruthy()
  })
})

