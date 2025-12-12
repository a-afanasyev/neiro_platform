import { test, expect } from '@playwright/test'

/**
 * E2E тесты для функциональности отчетов
 *
 * Тестирует:
 * - Создание отчета родителем
 * - Загрузку медиа-файлов
 * - Просмотр отчета специалистом
 * - Оставление отзыва специалистом
 */
test.describe('Reports Management', () => {
  test.beforeEach(async ({ page }) => {
    // Авторизация как родитель
    await page.goto('/login')
    await page.fill('input[type="email"]', 'parent1@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test.skip('R-1: Родитель может создать отчет', async ({ page }) => {
    /**
     * ⚠️ ТРЕБУЮТСЯ ТЕСТОВЫЕ ДАННЫЕ
     *
     * Тест пропущен, так как в seed данных отсутствуют задания в статусе "in_progress"
     * для создания отчетов.
     *
     * Требуется обновить: nero_platform/packages/database/prisma/seed.ts
     * - Создать задания с status: 'in_progress'
     * - Убедиться что они связаны с parent1@example.com
     *
     * Приоритет: Medium
     * Оценка: 30 минут на обновление seed данных
     */
    // Переход к заданиям
    await page.click('[data-testid=assignments-link]')
    await page.waitForURL('/dashboard/assignments')

    // Клик на "Завершить" для первого задания
    await page.click('[data-testid=complete-assignment-0]')
    await page.waitForSelector('[data-testid=create-report-dialog]')

    // Заполнение формы
    await page.selectOption('[data-testid=mood-select]', 'Хорошее')
    await page.fill('[data-testid=duration-input]', '30')
    await page.fill('[data-testid=notes-textarea]', 'Ребенок с удовольствием выполнил задание')

    // Отправка отчета
    await page.click('[data-testid=submit-report]')
    await page.waitForSelector('[data-testid=success-toast]')

    // Проверка, что задание отмечено как завершенное
    await page.goto('/dashboard/assignments')
    const assignmentStatus = await page.textContent('[data-testid=assignment-status-0]')
    expect(assignmentStatus).toContain('Завершено')
  })

  test.skip('R-2: Родитель может загрузить фото', async ({ page }) => {
    /**
     * ⚠️ ТРЕБУЮТСЯ ТЕСТОВЫЕ ДАННЫЕ
     *
     * Тест пропущен по той же причине что и R-1 - отсутствуют задания
     * в статусе "in_progress".
     */
    await page.goto('/dashboard/assignments')
    await page.click('[data-testid=complete-assignment-0]')

    // Тест drag & drop
    const fileInput = page.locator('[data-testid=file-input]')
    await fileInput.setInputFiles('test-files/test-image.jpg')

    // Проверка превью изображения
    await expect(page.locator('[data-testid=image-preview]')).toBeVisible()

    // Отправка отчета с медиа
    await page.click('[data-testid=submit-report]')
    await page.waitForSelector('[data-testid=success-toast]')
  })

  test.skip('R-3: Специалист может просмотреть отчет', async ({ page }) => {
    /**
     * ⚠️ ТРЕБУЮТСЯ ТЕСТОВЫЕ ДАННЫЕ
     *
     * Тест пропущен, так как в базе данных отсутствуют созданные отчеты.
     *
     * Требуется обновить: nero_platform/packages/database/prisma/seed.ts
     * - Создать минимум 3 тестовых отчета
     * - Связать их с заданиями и детьми
     *
     * Приоритет: Medium
     * Оценка: 30 минут на обновление seed данных
     */
    // Авторизация как специалист
    await page.goto('/login')
    await page.fill('input[type="email"]', 'specialist1@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Переход к отчетам
    await page.click('[data-testid=reports-link]')
    await page.waitForURL('/dashboard/reports')

    // Проверка списка
    await expect(page.locator('[data-testid=report-card]')).toHaveCount(3)

    // Клик на "Просмотреть"
    await page.click('[data-testid=view-report-0]')
    await page.waitForSelector('[data-testid=report-details]')

    // Проверка рендера медиа
    await expect(page.locator('[data-testid=report-media]')).toBeVisible()
  })

  test.skip('R-4: Специалист может оставить отзыв', async ({ page }) => {
    /**
     * ⚠️ ТРЕБУЮТСЯ ТЕСТОВЫЕ ДАННЫЕ
     *
     * Тест пропущен по той же причине что и R-3 - отсутствуют отчеты для проверки.
     */
    // Авторизация как специалист и переход к отчету
    await page.goto('/login')
    await page.fill('input[type="email"]', 'specialist1@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    await page.goto('/dashboard/reports')
    await page.click('[data-testid=view-report-0]')

    // Открытие формы отзыва
    await page.click('[data-testid=review-button]')
    await page.waitForSelector('[data-testid=review-dialog]')

    // Заполнение формы отзыва
    await page.click('[data-testid=approved-radio]')
    await page.fill('[data-testid=review-notes]', 'Отличная работа, продолжайте в том же духе!')

    // Сохранение отзыва
    await page.click('[data-testid=save-review]')
    await page.waitForSelector('[data-testid=success-toast]')

    // Проверка изменения статуса на "проверено"
    await page.reload()
    const status = await page.textContent('[data-testid=report-status-0]')
    expect(status).toContain('Проверено')
  })
})
