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
    await page.fill('input[type="email"]', 'parent1@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('PR-1: Родитель видит прогресс ребенка', async ({ page }) => {
    // Переход к прогрессу
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
  })

  test('PR-2: Графики отображаются корректно', async ({ page }) => {
    // Переход к прогрессу
    await page.click('[data-testid=progress-link]')
    await page.waitForURL('/dashboard/progress')

    // Ожидание загрузки графиков
    await page.waitForSelector('[data-testid=line-chart]', { timeout: 10000 })
    await page.waitForSelector('[data-testid=pie-chart]', { timeout: 10000 })

    // Проверка что оба графика видны
    await expect(page.locator('[data-testid=line-chart]')).toBeVisible()
    await expect(page.locator('[data-testid=pie-chart]')).toBeVisible()

    // Проверка что линейный график загружен и имеет SVG
    const lineSvg = page.locator('[data-testid=line-chart] svg').first()
    await expect(lineSvg).toBeVisible()

    // Проверка что есть данные в линейном графике
    const lineChartLine = page.locator('[data-testid=line-chart] .recharts-line')
    await expect(lineChartLine).toBeVisible()

    // Для круговой диаграммы просто проверяем что элемент присутствует
    // Содержимое может варьироваться в зависимости от данных (может показывать пустое состояние)
  })

  test('PR-3: Специалист видит обзор детей', async ({ page }) => {
    // Авторизация как специалист
    await page.goto('/login')
    await page.fill('input[type="email"]', 'specialist1@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Переход к аналитике
    await page.click('[data-testid=analytics-link]')
    await page.waitForURL('/dashboard/analytics')

    // Проверка что страница загрузилась
    await page.waitForSelector('h1', { timeout: 5000 })

    // Ожидаем загрузку данных
    await page.waitForTimeout(3000)

    // Проверяем что есть обзор с данными
    await expect(page.locator('[data-testid=children-overview]')).toBeVisible({ timeout: 10000 })

    // Проверка KPI карточек
    await expect(page.locator('[data-testid=analytics-kpi-completed]')).toBeVisible()
    await expect(page.locator('[data-testid=analytics-kpi-rate]')).toBeVisible()

    // Проверка активности
    await expect(page.locator('[data-testid=top-performers]')).toBeVisible()
  })
})
