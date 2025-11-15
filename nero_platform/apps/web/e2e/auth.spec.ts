import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Очищаем storage перед каждым тестом
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())
  })

  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page).toHaveTitle(/Neiro Platform/)
    await expect(page.locator('h1')).toContainText('Neiro Platform')
    await expect(page.locator('text=Добро пожаловать')).toBeVisible()
  })

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.goto('/login')
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Проверяем, что браузер показывает нативные validation ошибки
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.locator('input[type="email"]').fill('invalid@example.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()
    
    // Ожидаем сообщение об ошибке
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 })
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Используем тестовые учетные данные
    await page.locator('input[type="email"]').fill('admin@neiro.dev')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    
    // Ожидаем редирект на dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    
    // Проверяем, что отображается имя пользователя
    await expect(page.locator('text=Admin User')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    
    await page.locator('text=Зарегистрироваться').click()
    
    await expect(page).toHaveURL('/register')
    await expect(page.locator('text=Создание аккаунта')).toBeVisible()
  })

  test('should navigate back to login from register', async ({ page }) => {
    await page.goto('/register')
    
    await page.locator('text=Войти').click()
    
    await expect(page).toHaveURL('/login')
    await expect(page.locator('text=Добро пожаловать')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Сначала логинимся
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@neiro.dev')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    
    // Теперь выходим
    await page.locator('button:has-text("Выйти")').click()
    
    // Проверяем редирект на login
    await expect(page).toHaveURL('/login', { timeout: 5000 })
    
    // Проверяем, что токены очищены
    const hasTokens = await page.evaluate(() => {
      return localStorage.getItem('accessToken') !== null
    })
    expect(hasTokens).toBe(false)
  })

  test('should persist auth state after page reload', async ({ page }) => {
    // Логинимся
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@neiro.dev')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    
    // Перезагружаем страницу
    await page.reload()
    
    // Проверяем, что все еще на dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Admin User')).toBeVisible({ timeout: 5000 })
  })

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Должен редиректнуть на login
    await expect(page).toHaveURL('/login', { timeout: 5000 })
  })
})

test.describe('Registration Flow', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/register')
    
    await expect(page.locator('text=Создание аккаунта')).toBeVisible()
    await expect(page.locator('input[id="firstName"]')).toBeVisible()
    await expect(page.locator('input[id="lastName"]')).toBeVisible()
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible()
  })

  test('should show validation error for password mismatch', async ({ page }) => {
    await page.goto('/register')
    
    await page.locator('input[id="firstName"]').fill('John')
    await page.locator('input[id="lastName"]').fill('Doe')
    await page.locator('input[id="email"]').fill('john@example.com')
    await page.locator('input[id="password"]').fill('password123')
    await page.locator('input[id="confirmPassword"]').fill('different123')
    
    await page.locator('button[type="submit"]').click()
    
    await expect(page.locator('text=Пароли не совпадают')).toBeVisible({ timeout: 5000 })
  })

  test('should show info about invitation-only registration', async ({ page }) => {
    await page.goto('/register')
    
    await page.locator('input[id="firstName"]').fill('John')
    await page.locator('input[id="lastName"]').fill('Doe')
    await page.locator('input[id="email"]').fill('john@example.com')
    await page.locator('input[id="password"]').fill('password123')
    await page.locator('input[id="confirmPassword"]').fill('password123')
    
    await page.locator('button[type="submit"]').click()
    
    // Проверяем информационное сообщение
    await expect(page.locator('text=только по приглашению')).toBeVisible({ timeout: 5000 })
  })
})

