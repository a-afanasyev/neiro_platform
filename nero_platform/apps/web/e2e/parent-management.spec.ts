/**
 * E2E тесты для управления родителями/опекунами
 *
 * Тестовые сценарии:
 * - Добавление родителя к ребенку
 * - Редактирование связи родителя с ребенком
 * - Удаление родителя (с валидацией последнего опекуна)
 * - Создание ребенка с обязательным выбором родителя
 */

import { test, expect } from '@playwright/test'

/**
 * Вспомогательная функция для входа
 */
async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

/**
 * Очистка storage перед тестом
 */
async function clearStorage(page: any) {
  await page.context().clearCookies()
  try {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  } catch (error) {
    console.warn('Could not clear storage:', error)
  }
}

test.describe('Parent Management - Управление родителями', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('PM-1: Admin может просмотреть родителей ребенка', async ({ page }) => {
    // Вход под админом
    await loginAs(page, 'admin@neiro.dev', 'admin123')

    // Переход в раздел "Дети"
    await page.click('text=Дети')
    await expect(page).toHaveURL(/\/dashboard\/children/)

    // Клик на первую карточку ребенка (кнопка "Подробнее")
    await page.locator('button:has-text("Подробнее")').first().click()
    await page.waitForURL(/\/dashboard\/children\/[^\/]+$/, { timeout: 10000 })

    // Проверка наличия секции "Родители / Опекуны"
    await expect(page.locator('text=Родители / Опекуны')).toBeVisible()

    // Проверка наличия кнопки "Добавить родителя"
    await expect(page.locator('button:has-text("Добавить родителя")')).toBeVisible()
  })

  test('PM-2: Admin может добавить родителя к ребенку', async ({ page }) => {
    // Вход под админом
    await loginAs(page, 'admin@neiro.dev', 'admin123')

    // Переход к детализации ребенка
    await page.click('text=Дети')
    await page.locator('button:has-text("Подробнее")').first().click()

    // Клик на "Добавить родителя"
    await page.click('button:has-text("Добавить родителя")')

    // Ожидание открытия диалога
    await expect(page.locator('text=Добавить родителя/опекуна')).toBeVisible()

    // Выбор родителя из списка
    await page.click('button:has-text("Выберите пользователя")')
    await page.waitForSelector('[role="option"]', { state: 'visible' })
    await page.locator('[role="option"]').first().click()

    // Выбор типа отношений
    await page.locator('label:has-text("Тип отношений")').locator('..').locator('button').click()
    await page.waitForSelector('[role="option"]:has-text("Опекун")', { state: 'visible' })
    await page.locator('[role="option"]:has-text("Опекун")').click()

    // Проверка что чекбокс "Законный представитель" включен по умолчанию
    const checkbox = page.locator('input[type="checkbox"]#legalGuardian')
    await expect(checkbox).toBeChecked()

    // Клик на "Добавить" - используем force для обхода overlay
    await page.locator('button:has-text("Добавить")').last().click({ force: true })

    // Ожидание закрытия диалога и обновления списка
    await expect(page.locator('text=Добавить родителя/опекуна')).not.toBeVisible({ timeout: 5000 })

    // Проверка что родитель появился в списке (badge "Опекун")
    await expect(page.locator('.inline-flex:has-text("Опекун")').first()).toBeVisible()
  })

  test('PM-3: Admin может редактировать связь родителя', async ({ page }) => {
    // Вход под админом
    await loginAs(page, 'admin@neiro.dev', 'admin123')

    // Переход к детализации ребенка
    await page.click('text=Дети')
    await page.locator('button:has-text("Подробнее")').first().click()

    // Проверка наличия родителя
    const parentCard = page.locator('[class*="border rounded-lg"]').first()
    await expect(parentCard).toBeVisible()

    // Клик на "Редактировать" в карточке родителя
    await parentCard.locator('button:has-text("Редактировать")').click()

    // Ожидание открытия диалога редактирования
    await expect(page.locator('text=Редактировать родителя/опекуна')).toBeVisible()

    // Изменение типа отношений
    await page.locator('label:has-text("Тип отношений")').locator('..').locator('button').click()
    await page.locator('[role="option"]:has-text("Мать")').click()

    // Клик на "Сохранить"
    await page.click('button:has-text("Сохранить")')

    // Ожидание закрытия диалога
    await expect(page.locator('text=Редактировать родителя/опекуна')).not.toBeVisible({ timeout: 5000 })

    // Проверка что тип отношений изменился
    await expect(page.locator('text=Мать')).toBeVisible()
  })

  test('PM-4: Нельзя удалить единственного законного представителя', async ({ page }) => {
    // Вход под админом
    await loginAs(page, 'admin@neiro.dev', 'admin123')

    // Переход к детализации ребенка
    await page.click('text=Дети')
    await page.locator('button:has-text("Подробнее")').first().click()

    // Проверка что у ребенка только один родитель с бейджем "Законный представитель"
    const legalGuardianBadges = page.locator('text=Законный представитель')
    const count = await legalGuardianBadges.count()

    if (count === 1) {
      // Проверка что кнопка "Удалить" disabled или показывается предупреждение
      const deleteButton = page.locator('button:has-text("Удалить")').first()
      const isDisabled = await deleteButton.isDisabled()

      if (!isDisabled) {
        // Если кнопка не disabled, пробуем удалить и ожидаем ошибку
        await deleteButton.click()

        // Подтверждение в диалоге
        await page.click('button:has-text("Удалить"):not([disabled])')

        // Ожидание сообщения об ошибке
        await expect(page.locator('text=/единственного.*представителя/i')).toBeVisible({ timeout: 3000 })
      } else {
        // Кнопка disabled - это правильно
        expect(isDisabled).toBe(true)
      }
    }
  })

  test('PM-5: Создание ребенка требует выбора родителя', async ({ page }) => {
    // Вход под админом
    await loginAs(page, 'admin@neiro.dev', 'admin123')

    // Переход в раздел "Дети"
    await page.click('text=Дети')

    // Клик на "Добавить ребенка"
    await page.click('button:has-text("+ Добавить ребенка")')

    // Ожидание открытия диалога
    await expect(page.locator('h2:has-text("Добавить ребенка")')).toBeVisible()

    // Заполнение обязательных полей (кроме родителя)
    await page.fill('input#firstName', 'Тестовый')
    await page.fill('input#lastName', 'Ребенок')
    await page.fill('input#dateOfBirth', '2020-01-01')

    // Проверка что кнопка "Создать" disabled без выбора родителя
    const createButton = page.locator('button:has-text("Создать")')
    await expect(createButton).toBeDisabled()

    // Выбор родителя
    await page.click('button:has-text("Выберите пользователя")')
    await page.locator('[role="option"]').first().click()

    // Теперь кнопка должна стать активной
    await expect(createButton).not.toBeDisabled()
  })

  test('PM-6: Можно удалить родителя если есть другой законный представитель', async ({ page }) => {
    // Вход под админом
    await loginAs(page, 'admin@neiro.dev', 'admin123')

    // Переход к детализации ребенка
    await page.click('text=Дети')
    await page.locator('button:has-text("Подробнее")').first().click()

    // Проверка количества законных представителей
    const legalGuardianBadges = page.locator('text=Законный представитель')
    const count = await legalGuardianBadges.count()

    if (count > 1) {
      // Если есть больше одного, можно удалить
      const deleteButton = page.locator('button:has-text("Удалить")').first()
      await deleteButton.click()

      // Подтверждение в диалоге
      await page.locator('button:has-text("Удалить"):not([disabled])').last().click()

      // Ожидание успешного удаления (диалог закрылся)
      await expect(page.locator('text=Удалить связь с родителем')).not.toBeVisible({ timeout: 5000 })
    } else {
      // Если только один, добавим второго сначала
      await page.click('button:has-text("Добавить родителя")')
      await expect(page.locator('text=Добавить родителя/опекуна')).toBeVisible()
      await page.click('button:has-text("Выберите пользователя")')
      await page.waitForSelector('[role="option"]', { state: 'visible' })
      await page.locator('[role="option"]').nth(1).click()
      await page.locator('button:has-text("Добавить")').last().click({ force: true })

      // Теперь удаляем первого
      await page.waitForTimeout(1000) // Даем время на обновление
      const deleteButton = page.locator('button:has-text("Удалить")').first()
      await deleteButton.click()
      await page.locator('button:has-text("Удалить"):not([disabled])').last().click()

      await expect(page.locator('text=Удалить связь с родителем')).not.toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Parent Management - Валидации', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('PM-V1: Нельзя снять статус законного представителя у единственного опекуна', async ({ page }) => {
    // Вход под админом
    await loginAs(page, 'admin@neiro.dev', 'admin123')

    // Переход к детализации ребенка
    await page.click('text=Дети')
    await page.locator('button:has-text("Подробнее")').first().click()

    // Проверка количества законных представителей
    const legalGuardianBadges = page.locator('text=Законный представитель')
    const count = await legalGuardianBadges.count()

    if (count === 1) {
      // Открыть диалог редактирования
      await page.locator('button:has-text("Редактировать")').first().click()

      // Попытка снять галочку "Законный представитель"
      const checkbox = page.locator('input[type="checkbox"]#legalGuardian')
      await checkbox.uncheck()

      // Клик на "Сохранить"
      await page.click('button:has-text("Сохранить")')

      // Ожидание сообщения об ошибке
      await expect(page.locator('text=/единственного.*опекуна/i')).toBeVisible({ timeout: 3000 })
    }
  })

  test('PM-V2: Показывается предупреждение при снятии статуса если есть другие опекуны', async ({ page }) => {
    // Вход под админом
    await loginAs(page, 'admin@neiro.dev', 'admin123')

    // Переход к детализации ребенка
    await page.click('text=Дети')
    await page.locator('button:has-text("Подробнее")').first().click()

    // Добавляем второго родителя если нужно
    const legalGuardianBadges = page.locator('text=Законный представитель')
    let count = await legalGuardianBadges.count()

    if (count === 1) {
      await page.click('button:has-text("Добавить родителя")')
      await expect(page.locator('text=Добавить родителя/опекуна')).toBeVisible()
      await page.click('button:has-text("Выберите пользователя")')
      await page.waitForSelector('[role="option"]', { state: 'visible' })
      await page.locator('[role="option"]').nth(1).click()
      await page.locator('button:has-text("Добавить")').last().click({ force: true })
      await expect(page.locator('text=Добавить родителя/опекуна')).not.toBeVisible({ timeout: 5000 })
      await page.waitForTimeout(1000)
    }

    // Теперь редактируем первого
    await page.locator('button:has-text("Редактировать")').first().click()

    // Снимаем галочку "Законный представитель"
    const checkbox = page.locator('input[type="checkbox"]#legalGuardian')
    await checkbox.uncheck()

    // Должно показаться предупреждение
    await expect(page.locator('text=/останется.*представитель/i')).toBeVisible()
  })
})
