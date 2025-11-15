import { test, expect } from '@playwright/test'

test.describe('Dashboard Flow', () => {
  // Хелпер для логина
  async function login(page: any) {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@neiro.dev')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  }

  test('should display dashboard after login', async ({ page }) => {
    await login(page)
    
    // Проверяем основные элементы dashboard
    await expect(page.locator('h1')).toContainText(/Добр(ое утро|ый день|ый вечер)/)
    await expect(page.locator('text=Быстрые действия')).toBeVisible()
    await expect(page.locator('text=Статистика')).toBeVisible()
  })

  test('should navigate to children page', async ({ page }) => {
    await login(page)
    
    // Клик по навигационной ссылке
    await page.locator('nav a:has-text("Дети")').first().click()
    
    await expect(page).toHaveURL('/dashboard/children')
    await expect(page.locator('h1')).toContainText('Дети')
  })

  test('should navigate to diagnostics page', async ({ page }) => {
    await login(page)
    
    await page.locator('nav a:has-text("Диагностика")').first().click()
    
    await expect(page).toHaveURL('/dashboard/diagnostics')
    await expect(page.locator('h1')).toContainText('Диагностика')
  })

  test('should display navigation menu', async ({ page }) => {
    await login(page)
    
    // Проверяем наличие основных пунктов меню
    await expect(page.locator('nav a:has-text("Главная")')).toBeVisible()
    await expect(page.locator('nav a:has-text("Пользователи")')).toBeVisible()
    await expect(page.locator('nav a:has-text("Дети")')).toBeVisible()
  })

  test('should highlight active navigation item', async ({ page }) => {
    await login(page)
    
    // Главная страница должна быть активной
    const homeLink = page.locator('nav a[href="/dashboard"]').first()
    const homeClasses = await homeLink.getAttribute('class')
    expect(homeClasses).toContain('bg-primary-100')
    
    // Переходим на страницу детей
    await page.locator('nav a:has-text("Дети")').first().click()
    
    // Теперь Дети должна быть активной
    const childrenLink = page.locator('nav a[href="/dashboard/children"]').first()
    const childrenClasses = await childrenLink.getAttribute('class')
    expect(childrenClasses).toContain('bg-primary-100')
  })
})

test.describe('Children Management Flow', () => {
  async function login(page: any) {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@neiro.dev')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  }

  test('should display children list page', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/children')
    
    await expect(page.locator('h1')).toContainText('Дети')
    await expect(page.locator('button:has-text("Добавить ребенка")')).toBeVisible()
  })

  test('should open create child dialog', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/children')
    
    await page.locator('button:has-text("Добавить ребенка")').click()
    
    // Проверяем, что диалог открылся
    await expect(page.locator('text=Заполните информацию о ребенке')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[id="firstName"]')).toBeVisible()
    await expect(page.locator('input[id="lastName"]')).toBeVisible()
    await expect(page.locator('input[id="dateOfBirth"]')).toBeVisible()
  })

  test('should close create child dialog on cancel', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/children')
    
    await page.locator('button:has-text("Добавить ребенка")').click()
    await expect(page.locator('text=Заполните информацию о ребенке')).toBeVisible({ timeout: 5000 })
    
    await page.locator('button:has-text("Отмена")').click()
    
    // Проверяем, что диалог закрылся
    await expect(page.locator('text=Заполните информацию о ребенке')).not.toBeVisible({ timeout: 5000 })
  })

  test('should validate required fields in create child form', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/children')
    
    await page.locator('button:has-text("Добавить ребенка")').click()
    
    // Пытаемся отправить пустую форму
    await page.locator('button:has-text("Создать")').click()
    
    // Проверяем, что браузер показывает validation ошибки
    const firstNameInput = page.locator('input[id="firstName"]')
    const isInvalid = await firstNameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })
})

test.describe('Diagnostics Management Flow', () => {
  async function login(page: any) {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@neiro.dev')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  }

  test('should display diagnostics page', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/diagnostics')
    
    await expect(page.locator('h1')).toContainText('Диагностика')
    await expect(page.locator('text=Доступные опросники')).toBeVisible()
    await expect(page.locator('button:has-text("Новая диагностика")')).toBeVisible()
  })

  test('should display available questionnaires', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/diagnostics')
    
    // Проверяем наличие карточек опросников
    await expect(page.locator('text=CARS')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=ABC')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=ATEC')).toBeVisible({ timeout: 10000 })
  })

  test('should open create session dialog', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/diagnostics')
    
    await page.locator('button:has-text("Новая диагностика")').click()
    
    // Проверяем, что диалог открылся
    await expect(page.locator('text=Создать диагностическую сессию')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('select').first()).toBeVisible()
  })

  test('should close create session dialog on cancel', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard/diagnostics')
    
    await page.locator('button:has-text("Новая диагностика")').click()
    await expect(page.locator('text=Создать диагностическую сессию')).toBeVisible({ timeout: 5000 })
    
    await page.locator('button:has-text("Отмена")').click()
    
    // Проверяем, что диалог закрылся
    await expect(page.locator('text=Создать диагностическую сессию')).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('Role-based Access Control', () => {
  test('should restrict parent from accessing admin pages', async ({ page }) => {
    // Логинимся как родитель
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('parent1@example.com')
    await page.locator('input[type="password"]').fill('parent123')
    await page.locator('button[type="submit"]').click()
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    
    // Проверяем, что меню родителя отличается
    await expect(page.locator('nav a:has-text("Пользователи")')).not.toBeVisible()
    await expect(page.locator('nav a:has-text("Настройки")')).not.toBeVisible()
    
    // Но есть доступ к детям и заданиям
    await expect(page.locator('nav a:has-text("Мои дети")')).toBeVisible()
    await expect(page.locator('nav a:has-text("Задания")')).toBeVisible()
  })

  test('should display different dashboards for different roles', async ({ page }) => {
    // Логин как админ
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@neiro.dev')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.locator('text=Панель администратора')).toBeVisible()
    
    // Выход
    await page.locator('button:has-text("Выйти")').click()
    
    // Логин как специалист
    await page.locator('input[type="email"]').fill('neuro@neiro.dev')
    await page.locator('input[type="password"]').fill('neuro123')
    await page.locator('button[type="submit"]').click()
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.locator('text=Панель специалиста')).toBeVisible()
  })
})

