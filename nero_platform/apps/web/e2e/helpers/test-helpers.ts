/**
 * E2E Test Helper Functions
 *
 * Общие вспомогательные функции для E2E тестов
 */

import { Page, expect } from '@playwright/test'

/**
 * Авторизация пользователя
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

/**
 * Очистка storage перед тестом
 */
export async function clearStorage(page: Page) {
  await page.context().clearCookies()
  try {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  } catch (error) {
    console.warn('Could not clear storage:', error)
  }
}

/**
 * Ожидание API вызова
 */
export async function waitForApiCall(page: Page, urlPattern: string | RegExp) {
  await page.waitForResponse((response) => {
    const url = response.url()
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern)
    }
    return urlPattern.test(url)
  }, { timeout: 10000 })
}

/**
 * Ожидание загрузки данных
 */
export async function waitForDataLoad(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 10000 })
}

/**
 * Ожидание появления toast уведомления
 */
export async function waitForToast(page: Page, type: 'success' | 'error' = 'success') {
  const selector = type === 'success'
    ? '[data-testid="success-toast"], [role="alert"]:has-text("успешно")'
    : '[data-testid="error-toast"], [role="alert"]:has-text("ошибка")'

  await page.waitForSelector(selector, { state: 'visible', timeout: 5000 })
}

/**
 * Заполнение формы ребенка
 */
export async function fillChildForm(page: Page, data: {
  firstName: string
  lastName: string
  dateOfBirth: string
  diagnosis?: string
  parentIndex?: number
  relationship?: string
  legalGuardian?: boolean
}) {
  await page.fill('input#firstName', data.firstName)
  await page.fill('input#lastName', data.lastName)
  await page.fill('input#dateOfBirth', data.dateOfBirth)

  if (data.diagnosis) {
    await page.fill('input#diagnosis', data.diagnosis)
  }

  if (data.parentIndex !== undefined) {
    // Select parent from dropdown
    await page.click('button:has-text("Выберите пользователя")')
    await page.waitForSelector('[role="option"]', { state: 'visible' })
    await page.locator('[role="option"]').nth(data.parentIndex).click()
  }

  if (data.relationship) {
    // Select relationship type
    await page.locator('label:has-text("Тип отношений")').locator('..').locator('button').click()
    await page.locator(`[role="option"]:has-text("${data.relationship}")`).click()
  }

  if (data.legalGuardian !== undefined) {
    const checkbox = page.locator('input[type="checkbox"]#legalGuardian')
    const isChecked = await checkbox.isChecked()
    if (isChecked !== data.legalGuardian) {
      await checkbox.click()
    }
  }
}

/**
 * Заполнение формы пользователя
 */
export async function fillUserForm(page: Page, data: {
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'specialist' | 'parent'
  phone?: string
}) {
  await page.fill('[data-testid="firstName-input"]', data.firstName)
  await page.fill('[data-testid="lastName-input"]', data.lastName)
  await page.fill('[data-testid="email-input"]', data.email)
  await page.selectOption('[data-testid="role-select"]', data.role)

  if (data.phone) {
    await page.fill('[data-testid="phone-input"]', data.phone)
  }
}

/**
 * Генерация уникального email для тестов
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `${prefix}-${timestamp}-${random}@example.com`
}

/**
 * Генерация случайной даты рождения (для детей 2-18 лет)
 */
export function generateBirthDate(ageYears: number = 5): string {
  const today = new Date()
  const birthYear = today.getFullYear() - ageYears
  const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
  const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  return `${birthYear}-${birthMonth}-${birthDay}`
}

/**
 * Проверка наличия определенного количества элементов
 */
export async function expectElementCount(
  page: Page,
  selector: string,
  expectedCount: number
) {
  await expect(page.locator(selector)).toHaveCount(expectedCount, { timeout: 10000 })
}

/**
 * Скроллинг к элементу
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded()
}

/**
 * Ожидание исчезновения loading spinner
 */
export async function waitForLoadingComplete(page: Page) {
  // Wait for any loading spinners to disappear
  await page.waitForSelector('[data-testid="loading-spinner"]', {
    state: 'hidden',
    timeout: 10000
  }).catch(() => {
    // Ignore if spinner doesn't exist
  })
}

/**
 * Закрытие всех открытых диалогов
 */
export async function closeAllDialogs(page: Page) {
  const closeButtons = page.locator('[role="dialog"] button:has-text("Отмена"), [role="dialog"] button:has-text("Закрыть")')
  const count = await closeButtons.count()

  for (let i = 0; i < count; i++) {
    await closeButtons.nth(i).click()
    await page.waitForTimeout(300)
  }
}

/**
 * Подтверждение действия в confirmation dialog
 */
export async function confirmAction(page: Page, confirmButtonText: string = 'Удалить') {
  await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
  await page.click(`button:has-text("${confirmButtonText}")`)
}

/**
 * Получение текста первого элемента по селектору
 */
export async function getFirstElementText(page: Page, selector: string): Promise<string> {
  return await page.locator(selector).first().textContent() || ''
}

/**
 * Проверка redirect на страницу
 */
export async function expectRedirect(page: Page, url: string | RegExp) {
  await expect(page).toHaveURL(url, { timeout: 5000 })
}

/**
 * Drag and drop файла (для file input)
 */
export async function uploadFile(page: Page, inputSelector: string, filePath: string) {
  const fileInput = page.locator(inputSelector)
  await fileInput.setInputFiles(filePath)
}

/**
 * Проверка что элемент disabled
 */
export async function expectDisabled(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeDisabled()
}

/**
 * Проверка что элемент enabled
 */
export async function expectEnabled(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeEnabled()
}
