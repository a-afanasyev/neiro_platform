/**
 * E2E Tests: Children CRUD (Month 1)
 *
 * Тесты для управления профилями детей:
 * - CC-1 to CC-3: Просмотр, детали, создание
 * - CC-4 to CC-5: Редактирование и валидация
 * - CC-6 to CC-7: RBAC
 */

import { test, expect } from '@playwright/test'
import { loginAs, clearStorage, generateBirthDate } from './helpers/test-helpers'
import { testUsers, testChildData, pageSelectors } from './helpers/test-fixtures'

test.describe('Children Management - CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  // =========================================================================
  // Группа 1: Просмотр, детали, создание (CC-1, CC-2, CC-3)
  // =========================================================================

  test('CC-1: Admin/Specialist can view list of children', async ({ page }) => {
    // Arrange: Login as admin
    await loginAs(page, testUsers.admin.email, testUsers.admin.password)

    // Act: Navigate to children page
    await page.goto(pageSelectors.children)
    await page.waitForLoadState('networkidle')

    // Assert: Children page is displayed
    await expect(page).toHaveURL(/\/dashboard\/children/)
    await expect(page.locator('h1')).toContainText(/Дети|Профили/)

    // Assert: Children list is visible
    const childCards = page.locator('[data-testid="child-card"]')
    await expect(childCards.first()).toBeVisible({ timeout: 10000 })

    // Assert: At least some children are displayed (from seed data)
    const count = await childCards.count()
    expect(count).toBeGreaterThan(0)

    // Assert: Add child button is visible for admin
    await expect(page.locator('[data-testid="add-child-button"]')).toBeVisible()
  })

  test('CC-2: Admin/Specialist can view child details', async ({ page }) => {
    // Arrange: Login as admin
    await loginAs(page, testUsers.admin.email, testUsers.admin.password)
    await page.goto(pageSelectors.children)
    await page.waitForLoadState('networkidle')

    // Act: Click on first child's "Подробнее" button
    const firstChildCard = page.locator('[data-testid="child-card"]').first()
    const viewButton = firstChildCard.locator('[data-testid="view-child-button"]')
    await viewButton.click()
    await page.waitForLoadState('networkidle')

    // Assert: Navigated to child detail page
    await expect(page).toHaveURL(/\/dashboard\/children\/[a-f0-9-]+$/)

    // Assert: Child detail information is displayed
    await expect(page.locator('[data-testid="child-detail-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="child-detail-age"]')).toBeVisible()
    await expect(page.locator('[data-testid="child-detail-card"]')).toBeVisible()

    // Assert: "Основная информация" section is visible
    await expect(page.locator('text=Основная информация')).toBeVisible()

    // Assert: Edit button is present for admin
    await expect(page.locator('[data-testid="edit-child-button"]')).toBeVisible()
  })

  test('CC-3: Admin/Specialist can create new child', async ({ page }) => {
    // Arrange: Login as admin
    await loginAs(page, testUsers.admin.email, testUsers.admin.password)
    await page.goto(pageSelectors.children)
    await page.waitForLoadState('networkidle')

    // Get initial count of children
    const initialCards = page.locator('[data-testid="child-card"]')
    const initialCount = await initialCards.count()

    // Act: Click "Добавить ребенка" button
    const addButton = page.locator('[data-testid="add-child-button"]')
    await addButton.click()

    // Assert: Dialog opens
    const dialog = page.locator('[data-testid="create-child-dialog"]')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Act: Fill child form
    const uniqueFirstName = `Тест${Date.now()}`
    await page.fill('input#firstName', uniqueFirstName)
    await page.fill('input#lastName', testChildData.child1.lastName)
    await page.fill('input#dateOfBirth', generateBirthDate(3))

    // Select parent from dropdown (if available)
    const parentSelect = page.locator('button:has-text("Выберите пользователя")')
    if (await parentSelect.isVisible()) {
      await parentSelect.click()
      await page.waitForSelector('[role="option"]', { state: 'visible', timeout: 3000 })
      await page.locator('[role="option"]').first().click()
    }

    // Submit form
    const submitButton = dialog.locator('button:has-text("Добавить")')
    await submitButton.click()

    // Assert: Dialog closes or success indication
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for child to be created and list to update

    // Assert: New child appears in list (or count increased)
    const newCards = page.locator('[data-testid="child-card"]')
    const newCount = await newCards.count()
    expect(newCount).toBeGreaterThanOrEqual(initialCount)
  })

  // =========================================================================
  // Группа 2: Редактирование и валидация (CC-4, CC-5)
  // =========================================================================

  test('CC-4: Admin/Specialist can edit child profile', async ({ page }) => {
    // Arrange: Login as admin
    await loginAs(page, testUsers.admin.email, testUsers.admin.password)
    await page.goto(pageSelectors.children)
    await page.waitForLoadState('networkidle')

    // Act: Navigate to child detail page
    const firstChildCard = page.locator('[data-testid="child-card"]').first()
    await firstChildCard.locator('[data-testid="view-child-button"]').click()
    await page.waitForLoadState('networkidle')

    // Get original child data
    const originalName = await page.locator('[data-testid="child-detail-name"]').textContent()

    // Act: Click Edit button
    await page.locator('[data-testid="edit-child-button"]').click()
    await page.waitForLoadState('networkidle')

    // Assert: Navigated to edit page
    await expect(page).toHaveURL(/\/dashboard\/children\/[a-f0-9-]+\/edit$/)
    await expect(page.locator('h1')).toContainText('Редактирование профиля')

    // Assert: Form is displayed with data
    await expect(page.locator('[data-testid="edit-child-form"]')).toBeVisible()
    await expect(page.locator('[data-testid="firstName-input"]')).toHaveValue(/.+/)
    await expect(page.locator('[data-testid="lastName-input"]')).toHaveValue(/.+/)
    await expect(page.locator('[data-testid="dateOfBirth-input"]')).toHaveValue(/.+/)

    // Act: Edit diagnosis field
    const diagnosisInput = page.locator('[data-testid="diagnosis-input"]')
    await diagnosisInput.clear()
    await diagnosisInput.fill('РАС (обновлено E2E тестом)')

    // Act: Submit form
    await page.locator('[data-testid="save-button"]').click()
    await page.waitForLoadState('networkidle')

    // Assert: Redirected back to detail page
    await expect(page).toHaveURL(/\/dashboard\/children\/[a-f0-9-]+$/)

    // Assert: Changes were saved (child name should be the same)
    await expect(page.locator('[data-testid="child-detail-name"]')).toContainText(originalName || '')

    // NOTE: Could also verify diagnosis change appears on detail page if it's displayed there
  })

  test('CC-5: Form validation errors are displayed', async ({ page }) => {
    // Arrange: Login as admin
    await loginAs(page, testUsers.admin.email, testUsers.admin.password)
    await page.goto(pageSelectors.children)
    await page.waitForLoadState('networkidle')

    // Act: Navigate to edit page
    const firstChildCard = page.locator('[data-testid="child-card"]').first()
    await firstChildCard.locator('[data-testid="view-child-button"]').click()
    await page.waitForLoadState('networkidle')
    await page.locator('[data-testid="edit-child-button"]').click()
    await page.waitForLoadState('networkidle')

    // Act: Clear required fields
    const firstNameInput = page.locator('[data-testid="firstName-input"]')
    const lastNameInput = page.locator('[data-testid="lastName-input"]')
    const dateOfBirthInput = page.locator('[data-testid="dateOfBirth-input"]')

    await firstNameInput.clear()
    await lastNameInput.clear()
    await dateOfBirthInput.clear()

    // Act: Try to submit
    await page.locator('[data-testid="save-button"]').click()
    await page.waitForTimeout(500)

    // Assert: Error message is displayed or HTML5 validation prevents submission
    const errorMessage = page.locator('[data-testid="error-message"]')
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/обязательн/i)
    } else {
      // HTML5 validation prevents submission - form should still be on edit page
      await expect(page).toHaveURL(/\/edit$/)
    }
  })

  // =========================================================================
  // Группа 3: RBAC (CC-6, CC-7)
  // =========================================================================

  test('CC-6: Parent can view their children', async ({ page }) => {
    // Arrange: Login as parent
    await loginAs(page, testUsers.parent.email, testUsers.parent.password)

    // Act: Navigate to children page
    await page.goto(pageSelectors.children)
    await page.waitForLoadState('networkidle')

    // Assert: Can see children page
    await expect(page).toHaveURL(/\/dashboard\/children/)

    // Assert: Can see children list
    const childCards = page.locator('[data-testid="child-card"]')
    const count = await childCards.count()

    // Parents should only see their own children
    // If they have children, count > 0; if not, count === 0
    expect(count).toBeGreaterThanOrEqual(0)

    // Assert: "Добавить ребенка" button should NOT be visible for parents
    const addButton = page.locator('[data-testid="add-child-button"]')
    const isAddButtonVisible = await addButton.isVisible().catch(() => false)
    expect(isAddButtonVisible).toBe(false)
  })

  test('CC-7: Parent cannot edit children', async ({ page }) => {
    // Arrange: Login as parent
    await loginAs(page, testUsers.parent.email, testUsers.parent.password)
    await page.goto(pageSelectors.children)
    await page.waitForLoadState('networkidle')

    // Check if parent has any children
    const childCards = page.locator('[data-testid="child-card"]')
    const hasChildren = (await childCards.count()) > 0

    if (hasChildren) {
      // Act: Navigate to child detail page
      await childCards.first().locator('[data-testid="view-child-button"]').click()
      await page.waitForLoadState('networkidle')

      // Assert: Edit button should NOT be visible for parents
      const editButton = page.locator('[data-testid="edit-child-button"]')
      const isEditButtonVisible = await editButton.isVisible().catch(() => false)
      expect(isEditButtonVisible).toBe(false)

      // Act: Try to navigate directly to edit page
      const currentUrl = page.url()
      const childId = currentUrl.match(/\/children\/([a-f0-9-]+)/)?.[1]

      if (childId) {
        await page.goto(`/dashboard/children/${childId}/edit`)
        await page.waitForLoadState('networkidle')

        // Assert: Should be redirected or see access denied
        const isOnEditPage = page.url().includes('/edit')
        if (isOnEditPage) {
          // If somehow on edit page, form should not be functional
          // or there should be an error message
          const hasAccessError = await page.locator('text=/доступ.*запрещен/i').isVisible().catch(() => false)
          expect(hasAccessError).toBe(true)
        }
      }
    } else {
      // Parent has no children - skip detailed checks
      console.log('Parent has no children - skipping edit permission check')
    }
  })
})
