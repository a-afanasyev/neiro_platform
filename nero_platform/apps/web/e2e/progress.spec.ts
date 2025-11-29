import { test, expect } from '@playwright/test'

/**
 * E2E тесты для Progress Dashboard
 * 
 * Тестирует:
 * - Отображение прогресса ребенка
 * - Корректность рендера графиков
 * - Обзор детей для специалиста
 */
test.describe('Progress Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Авторизация как родитель
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'parent1@example.com')
    await page.fill('[data-testid=password]', 'parent123')
    await page.click('[data-testid=login-button]')
    await page.waitForURL('/dashboard')
  })

  test('PR-1: Родитель видит прогресс ребенка', async ({ page }) => {
    // Переход к прогрессу
    await page.click('[data-testid=progress-menu]')
    await page.click('[data-testid=progress-link]')
    await page.waitForURL('/dashboard/progress')
    
    // Проверка KPI карточек
    await expect(page.locator('[data-testid=kpi-card-completed]')).toBeVisible()
    await expect(page.locator('[data-testid=kpi-card-progress]')).toBeVisible()
    await expect(page.locator('[data-testid=kpi-card-mood]')).toBeVisible()
    await expect(page.locator('[data-testid=kpi-card-days]')).toBeVisible()
    
    // Проверка загрузки графиков
    await expect(page.locator('[data-testid=line-chart]')).toBeVisible()
    await expect(page.locator('[data-testid=pie-chart]')).toBeVisible()
    
    // Проверка секции целей
    await expect(page.locator('[data-testid=goals-section]')).toBeVisible()
  })

  test('PR-2: Графики отображаются корректно', async ({ page }) => {
    await page.goto('/dashboard/progress')
    
    // Ожидание загрузки графиков
    await page.waitForSelector('[data-testid=line-chart]')
    
    // Тест интерактивности графика
    await page.hover('[data-testid=line-chart-point-0]')
    await expect(page.locator('[data-testid=chart-tooltip]')).toBeVisible()
    
    // Тест круговой диаграммы
    await page.hover('[data-testid=pie-chart-segment-0]')
    await expect(page.locator('[data-testid=chart-tooltip]')).toBeVisible()
  })

  test('PR-3: Специалист видит обзор детей', async ({ page }) => {
    // Авторизация как специалист
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'specialist@neiro.dev')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=login-button]')
    
    await page.click('[data-testid=analytics-menu]')
    await page.click('[data-testid=analytics-link]')
    await page.waitForURL('/dashboard/analytics')
    
    // Проверка обзора
    await expect(page.locator('[data-testid=children-overview]')).toBeVisible()
    
    // Проверка списка лучших результатов
    await expect(page.locator('[data-testid=top-performers]')).toBeVisible()
  })
})
