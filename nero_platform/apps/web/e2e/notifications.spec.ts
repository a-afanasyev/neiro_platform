import { test, expect } from '@playwright/test'

/**
 * E2E тесты для функциональности уведомлений
 * 
 * Тестирует:
 * - Отображение уведомлений в bell
 * - Функциональность "прочитано"
 * - Сохранение настроек уведомлений
 */
test.describe('Notifications Management', () => {
  test.beforeEach(async ({ page }) => {
    // Авторизация как родитель
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'parent1@example.com')
    await page.fill('[data-testid=password]', 'parent123')
    await page.click('[data-testid=login-button]')
    await page.waitForURL('/dashboard')
  })

  test('N-1: Уведомления отображаются в bell', async ({ page }) => {
    // Проверка видимости bell в заголовке
    await expect(page.locator('[data-testid=notification-bell]')).toBeVisible()
    
    // Проверка наличия значка с количеством непрочитанных
    await expect(page.locator('[data-testid=notification-badge]')).toContainText('3')
    
    // Клик на bell
    await page.click('[data-testid=notification-bell]')
    
    // Проверка открытия dropdown со списком уведомлений
    await expect(page.locator('[data-testid=notification-dropdown]')).toBeVisible()
    await expect(page.locator('[data-testid=notification-item]')).toHaveCount(3)
  })

  test('N-2: Mark as read работает', async ({ page }) => {
    // Открытие dropdown уведомлений
    await page.click('[data-testid=notification-bell]')
    
    // Клик на непрочитанное уведомление
    await page.click('[data-testid=notification-item-0]')
    
    // Проверка, что уведомление отмечено как прочитанное (визуальное изменение)
    await expect(page.locator('[data-testid=notification-item-0]')).toHaveClass(/read/)
    
    // Проверка уменьшения счетчика на 1
    await expect(page.locator('[data-testid=notification-badge]')).toContainText('2')
    
    // Проверка кнопки "Отметить все как прочитанные"
    await page.click('[data-testid=mark-all-read]')
    await expect(page.locator('[data-testid=notification-badge]')).toContainText('0')
  })

  test('N-3: Настройки уведомлений сохраняются', async ({ page }) => {
    // Переход к настройкам профиля
    await page.click('[data-testid=profile-menu]')
    await page.click('[data-testid=settings-link]')
    
    // Открытие диалога настроек уведомлений
    await page.click('[data-testid=notification-settings]')
    await page.waitForSelector('[data-testid=preferences-dialog]')
    
    // Выключение email уведомлений
    await page.click('[data-testid=email-toggle]')
    
    // Выключение напоминаний о заданиях
    await page.click('[data-testid=assignments-toggle]')
    
    // Настройка тихих часов (22:00 - 08:00)
    await page.click('[data-testid=quiet-hours-toggle]')
    await page.fill('[data-testid=start-time]', '22:00')
    await page.fill('[data-testid=end-time]', '08:00')
    
    // Сохранение настроек
    await page.click('[data-testid=save-preferences]')
    await page.waitForSelector('[data-testid=success-toast]')
    
    // Перезагрузка страницы
    await page.reload()
    await page.click('[data-testid=notification-settings]')
    
    // Проверка, что настройки сохранились
    await expect(page.locator('[data-testid=email-toggle]')).not.toBeChecked()
    await expect(page.locator('[data-testid=assignments-toggle]')).not.toBeChecked()
    await expect(page.locator('[data-testid=start-time]')).toHaveValue('22:00')
    await expect(page.locator('[data-testid=end-time]')).toHaveValue('08:00')
  })
})
