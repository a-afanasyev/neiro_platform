# План Добавления E2E Тестов - Month 1-3

**Дата:** 2025-12-09
**Цель:** Закрыть критические пробелы в E2E покрытии
**Приоритет:** P0 - Критические тесты
**Оценка:** 50-70 новых тестов, 2-3 недели работы

---

## 📋 Структура Плана

### Phase 0: Подготовка (1 день)
- Изучить существующие паттерны тестов
- Настроить seed данные для новых тестов
- Проверить test-id в компонентах

### Phase 1: Month 1 Critical Tests (5-7 дней)
- Users CRUD (7-10 тестов)
- Children CRUD (5-7 тестов)
- Profile Management (3-5 тестов)

### Phase 2: Month 2 Critical Tests (3-5 дней)
- Routes editing (3-5 тестов)
- Assignments CRUD (5-7 тестов)

### Phase 3: Month 3 Critical Tests (4-6 дней)
- Reports List (5-7 тестов)
- Analytics Dashboard (5-7 тестов)

### Phase 4: Diagnostics Service (3-5 дней)
- Questionnaire flows (10-15 тестов)

---

## 🎯 Phase 1: Month 1 Critical Tests

### 1.1 Users Management Tests (users-management.spec.ts)

**Создать новый файл:** `nero_platform/apps/web/e2e/users-management.spec.ts`

#### Test Suite: User CRUD Operations

**UM-1: Admin может просмотреть список пользователей**
```typescript
test('UM-1: Admin может просмотреть список пользователей', async ({ page }) => {
  // Login as admin
  await loginAs(page, 'admin@neiro.dev', 'admin123')

  // Navigate to Users page
  await page.click('nav a:has-text("Пользователи")')
  await page.waitForURL('/dashboard/users')

  // Verify page loaded
  await expect(page.locator('h1')).toContainText('Пользователи')

  // Verify users list displayed
  await expect(page.locator('[data-testid="user-card"]')).toHaveCount(5, { timeout: 10000 })

  // Verify filter controls visible
  await expect(page.locator('[data-testid="role-filter"]')).toBeVisible()
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
})
```

**UM-2: Admin может создать нового пользователя**
```typescript
test('UM-2: Admin может создать нового пользователя', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/users')

  // Click "Add User" button
  await page.click('[data-testid="add-user-button"]')
  await expect(page.locator('[data-testid="create-user-dialog"]')).toBeVisible()

  // Fill form
  await page.fill('[data-testid="firstName-input"]', 'Иван')
  await page.fill('[data-testid="lastName-input"]', 'Тестов')
  await page.fill('[data-testid="email-input"]', `test-${Date.now()}@example.com`)
  await page.selectOption('[data-testid="role-select"]', 'parent')

  // Submit
  await page.click('[data-testid="submit-user"]')
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()

  // Verify user appears in list
  await expect(page.locator('text=Иван Тестов')).toBeVisible()
})
```

**UM-3: Admin может редактировать пользователя**
```typescript
test('UM-3: Admin может редактировать пользователя', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/users')

  // Click edit on first user
  await page.locator('[data-testid="edit-user-button"]').first().click()
  await expect(page.locator('[data-testid="edit-user-dialog"]')).toBeVisible()

  // Change first name
  await page.fill('[data-testid="firstName-input"]', 'Петр')

  // Save
  await page.click('[data-testid="save-user"]')
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()

  // Verify change
  await expect(page.locator('text=Петр').first()).toBeVisible()
})
```

**UM-4: Admin может удалить пользователя**
```typescript
test('UM-4: Admin может удалить пользователя', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/users')

  // Get initial count
  const initialCount = await page.locator('[data-testid="user-card"]').count()

  // Click delete on last user (safe test user)
  await page.locator('[data-testid="delete-user-button"]').last().click()

  // Confirm deletion
  await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
  await page.click('[data-testid="confirm-delete"]')

  // Verify user removed
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  await expect(page.locator('[data-testid="user-card"]')).toHaveCount(initialCount - 1)
})
```

**UM-5: Admin может изменить роль пользователя**
```typescript
test('UM-5: Admin может изменить роль пользователя', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/users')

  // Edit user
  await page.locator('[data-testid="edit-user-button"]').first().click()

  // Change role
  await page.selectOption('[data-testid="role-select"]', 'specialist')
  await page.click('[data-testid="save-user"]')

  // Verify role badge changed
  await expect(page.locator('[data-testid="role-badge"]').first()).toContainText('Специалист')
})
```

**UM-6: Admin может искать пользователей**
```typescript
test('UM-6: Admin может искать пользователей', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/users')

  // Enter search query
  await page.fill('[data-testid="search-input"]', 'parent1')
  await page.waitForTimeout(500) // debounce

  // Verify filtered results
  const results = page.locator('[data-testid="user-card"]')
  await expect(results).toHaveCount(1, { timeout: 5000 })
  await expect(results.first()).toContainText('parent1')
})
```

**UM-7: Admin может фильтровать по роли**
```typescript
test('UM-7: Admin может фильтровать по роли', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/users')

  // Select role filter
  await page.selectOption('[data-testid="role-filter"]', 'parent')
  await page.waitForTimeout(500)

  // Verify all results are parents
  const badges = page.locator('[data-testid="role-badge"]')
  const count = await badges.count()

  for (let i = 0; i < count; i++) {
    await expect(badges.nth(i)).toContainText('Родитель')
  }
})
```

**UM-8: Валидация email уникальности**
```typescript
test('UM-8: Валидация email уникальности', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/users')

  await page.click('[data-testid="add-user-button"]')

  // Try to use existing email
  await page.fill('[data-testid="email-input"]', 'parent1@example.com')
  await page.fill('[data-testid="firstName-input"]', 'Дубликат')
  await page.fill('[data-testid="lastName-input"]', 'Пользователь')
  await page.selectOption('[data-testid="role-select"]', 'parent')

  await page.click('[data-testid="submit-user"]')

  // Verify error message
  await expect(page.locator('text=/email.*уже.*использу/i')).toBeVisible()
})
```

**UM-9: Specialist не может управлять пользователями**
```typescript
test('UM-9: Specialist не может управлять пользователями', async ({ page }) => {
  await loginAs(page, 'specialist1@example.com', 'admin123')

  // Try to navigate to Users page
  await page.goto('/dashboard/users')

  // Should redirect or show 403
  await expect(page).not.toHaveURL('/dashboard/users')
  // OR
  await expect(page.locator('text=/доступ.*запрещен/i')).toBeVisible()
})
```

**UM-10: Admin может приглашать пользователей по email**
```typescript
test('UM-10: Admin может приглашать пользователей по email', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/users')

  // Click invite button
  await page.click('[data-testid="invite-user-button"]')
  await expect(page.locator('[data-testid="invite-dialog"]')).toBeVisible()

  // Fill email
  await page.fill('[data-testid="invite-email-input"]', 'newuser@example.com')
  await page.selectOption('[data-testid="invite-role-select"]', 'parent')

  // Send invitation
  await page.click('[data-testid="send-invitation"]')
  await expect(page.locator('text=/приглашение.*отправлено/i')).toBeVisible()
})
```

---

### 1.2 Children CRUD Complete Tests (children-crud.spec.ts)

**Создать новый файл:** `nero_platform/apps/web/e2e/children-crud.spec.ts`

#### Test Suite: Children CRUD Operations

**CC-1: Admin может создать ребенка (полный flow)**
```typescript
test('CC-1: Admin может создать ребенка (полный flow)', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/children')

  // Click add child
  await page.click('[data-testid="add-child-button"]')
  await expect(page.locator('h2:has-text("Добавить ребенка")')).toBeVisible()

  // Fill all fields
  await page.fill('input#firstName', 'Мария')
  await page.fill('input#lastName', 'Тестова')
  await page.fill('input#dateOfBirth', '2020-05-15')
  await page.selectOption('[data-testid="gender-select"]', 'female')

  // Select parent
  await page.click('button:has-text("Выберите пользователя")')
  await page.locator('[role="option"]').first().click()

  // Add notes (optional)
  await page.fill('[data-testid="notes-textarea"]', 'Тестовый ребенок')

  // Submit
  await page.click('button:has-text("Создать")')

  // Verify success
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()

  // Verify child in list
  await page.waitForURL('/dashboard/children')
  await expect(page.locator('text=Мария Тестова')).toBeVisible()
})
```

**CC-2: Admin может редактировать профиль ребенка**
```typescript
test('CC-2: Admin может редактировать профиль ребенка', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/children')

  // Click on child details
  await page.locator('[data-testid="view-child-button"]').first().click()
  await page.waitForURL(/\/dashboard\/children\/[^/]+$/)

  // Click edit
  await page.click('[data-testid="edit-child-button"]')
  await expect(page.locator('[data-testid="edit-child-dialog"]')).toBeVisible()

  // Change first name
  await page.fill('input#firstName', 'Анна')

  // Change notes
  await page.fill('[data-testid="notes-textarea"]', 'Обновленная информация')

  // Save
  await page.click('[data-testid="save-child"]')
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()

  // Verify changes
  await expect(page.locator('h1')).toContainText('Анна')
  await expect(page.locator('text=Обновленная информация')).toBeVisible()
})
```

**CC-3: Admin может добавить медицинскую информацию**
```typescript
test('CC-3: Admin может добавить медицинскую информацию', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/children')

  // Go to child detail
  await page.locator('[data-testid="view-child-button"]').first().click()

  // Click on medical info tab
  await page.click('[data-testid="medical-info-tab"]')

  // Add diagnosis
  await page.click('[data-testid="add-diagnosis-button"]')
  await page.fill('[data-testid="diagnosis-input"]', 'Аутизм, легкая форма')
  await page.fill('[data-testid="diagnosis-date"]', '2023-01-15')
  await page.click('[data-testid="save-diagnosis"]')

  // Verify saved
  await expect(page.locator('text=Аутизм, легкая форма')).toBeVisible()
})
```

**CC-4: Admin может удалить ребенка**
```typescript
test('CC-4: Admin может удалить ребенка', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/children')

  // Get initial count
  const initialCount = await page.locator('[data-testid="child-card"]').count()

  // Click on last child (test child)
  await page.locator('[data-testid="view-child-button"]').last().click()

  // Click delete
  await page.click('[data-testid="delete-child-button"]')

  // Confirm deletion
  await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
  await expect(page.locator('text=/удалить.*ребенка.*безвозвратно/i')).toBeVisible()
  await page.click('[data-testid="confirm-delete"]')

  // Verify redirect to list
  await expect(page).toHaveURL('/dashboard/children')
  await expect(page.locator('[data-testid="child-card"]')).toHaveCount(initialCount - 1)
})
```

**CC-5: Валидация возраста ребенка**
```typescript
test('CC-5: Валидация возраста ребенка', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/children')

  await page.click('[data-testid="add-child-button"]')

  // Try future date
  await page.fill('input#dateOfBirth', '2030-01-01')

  // Verify error
  await expect(page.locator('text=/дата.*рождения.*будущем/i')).toBeVisible()

  // Try very old date
  await page.fill('input#dateOfBirth', '1900-01-01')
  await expect(page.locator('text=/дата.*рождения.*недопустима/i')).toBeVisible()
})
```

**CC-6: Родитель видит только своих детей**
```typescript
test('CC-6: Родитель видит только своих детей', async ({ page }) => {
  await loginAs(page, 'parent1@example.com', 'parent123')

  await page.goto('/dashboard/children')

  // Verify only own children visible (parent1 has 2 children)
  await expect(page.locator('[data-testid="child-card"]')).toHaveCount(2)

  // Verify no "Add child" button for parent
  await expect(page.locator('[data-testid="add-child-button"]')).not.toBeVisible()
})
```

**CC-7: Поиск детей по имени**
```typescript
test('CC-7: Поиск детей по имени', async ({ page }) => {
  await loginAs(page, 'admin@neiro.dev', 'admin123')
  await page.goto('/dashboard/children')

  // Enter search query
  await page.fill('[data-testid="search-children-input"]', 'Алиса')
  await page.waitForTimeout(500)

  // Verify filtered results
  const results = page.locator('[data-testid="child-card"]')
  await expect(results).toHaveCount(1, { timeout: 5000 })
  await expect(results.first()).toContainText('Алиса')
})
```

---

### 1.3 Profile Management Tests (profile.spec.ts)

**Создать новый файл:** `nero_platform/apps/web/e2e/profile.spec.ts`

**PM-1: Пользователь может редактировать свой профиль**
**PM-2: Пользователь может сменить пароль**
**PM-3: Пользователь может загрузить аватар**
**PM-4: Валидация формы профиля**
**PM-5: Просмотр истории активности**

_(Детальные спецификации аналогично предыдущим)_

---

## 🎯 Phase 2: Month 2 Critical Tests

### 2.1 Routes Editing Tests (routes-advanced.spec.ts)

**Создать новый файл:** `nero_platform/apps/web/e2e/routes-advanced.spec.ts`

**RA-1: Специалист может редактировать маршрут**
```typescript
test('RA-1: Специалист может редактировать маршрут', async ({ page }) => {
  await loginAs(page, 'specialist1@example.com', 'admin123')
  await page.goto('/dashboard/routes')

  // Click on existing route
  await page.locator('[data-testid="route-card"]').first().click()
  await page.waitForURL(/\/dashboard\/routes\/[^/]+$/)

  // Click edit
  await page.click('[data-testid="edit-route-button"]')
  await expect(page.locator('[data-testid="route-builder"]')).toBeVisible()

  // Change route name
  await page.fill('[data-testid="route-name-input"]', 'Обновленный маршрут')

  // Save
  await page.click('[data-testid="save-route"]')
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()

  // Verify change
  await expect(page.locator('h1')).toContainText('Обновленный маршрут')
})
```

**RA-2: Route Builder - добавление фазы**
**RA-3: Route Builder - удаление фазы**
**RA-4: Route Builder - добавление цели**
**RA-5: Валидация структуры маршрута**

### 2.2 Assignments CRUD Tests (assignments-crud.spec.ts)

**AC-1: Специалист может редактировать назначение**
**AC-2: Специалист может отменить назначение**
**AC-3: Изменение даты назначения**
**AC-4: Bulk создание назначений**
**AC-5: Фильтрация по статусу**
**AC-6: Фильтрация по дате**
**AC-7: Календарь - переключение view**

---

## 🎯 Phase 3: Month 3 Critical Tests

### 3.1 Reports List Tests (reports-list.spec.ts)

**RL-1: Родитель видит список своих отчетов**
```typescript
test('RL-1: Родитель видит список своих отчетов', async ({ page }) => {
  await loginAs(page, 'parent1@example.com', 'parent123')

  await page.goto('/dashboard/reports')

  // Verify page loaded
  await expect(page.locator('h1')).toContainText('Отчеты')

  // Verify reports displayed
  await expect(page.locator('[data-testid="report-card"]')).toHaveCount(5, { timeout: 10000 })

  // Verify each card has required info
  const firstCard = page.locator('[data-testid="report-card"]').first()
  await expect(firstCard.locator('[data-testid="child-name"]')).toBeVisible()
  await expect(firstCard.locator('[data-testid="assignment-name"]')).toBeVisible()
  await expect(firstCard.locator('[data-testid="report-date"]')).toBeVisible()
  await expect(firstCard.locator('[data-testid="report-status"]')).toBeVisible()
})
```

**RL-2: Специалист видит все отчеты своих детей**
**RL-3: Фильтрация по ребенку**
**RL-4: Фильтрация по статусу (pending/reviewed)**
**RL-5: Фильтрация по дате**
**RL-6: Сортировка отчетов**
**RL-7: Переход к деталям отчета**

### 3.2 Analytics Dashboard Tests (analytics-dashboard.spec.ts)

**AD-1: Специалист видит аналитику всех детей**
**AD-2: DateRangeFilter работает**
**AD-3: Выбор конкретного ребенка**
**AD-4: Экспорт в PDF**
**AD-5: Экспорт в Excel**
**AD-6: Детальная статистика назначений**
**AD-7: Timeline активности**

---

## 🎯 Phase 4: Diagnostics Service Tests

### 4.1 Diagnostics Complete Flow (diagnostics-complete.spec.ts)

**DC-1: Создание диагностической сессии с CARS**
```typescript
test('DC-1: Создание диагностической сессии с CARS', async ({ page }) => {
  await loginAs(page, 'specialist1@example.com', 'admin123')
  await page.goto('/dashboard/diagnostics')

  // Click new session
  await page.click('[data-testid="new-session-button"]')
  await expect(page.locator('[data-testid="create-session-dialog"]')).toBeVisible()

  // Select child
  await page.selectOption('[data-testid="child-select"]', { index: 1 })

  // Select CARS questionnaire
  await page.selectOption('[data-testid="questionnaire-select"]', 'CARS')

  // Create session
  await page.click('[data-testid="create-session"]')
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()

  // Verify redirect to questionnaire
  await expect(page).toHaveURL(/\/dashboard\/diagnostics\/sessions\/[^/]+$/)
  await expect(page.locator('h1')).toContainText('CARS')
})
```

**DC-2: Заполнение вопросов CARS**
```typescript
test('DC-2: Заполнение вопросов CARS', async ({ page }) => {
  // ... login and navigate to active CARS session

  // Answer first 5 questions
  for (let i = 1; i <= 5; i++) {
    await page.click(`[data-testid="question-${i}-option-2"]`) // Select option 2 for each
    await page.waitForTimeout(300)
  }

  // Save progress
  await page.click('[data-testid="save-progress"]')
  await expect(page.locator('text=/прогресс.*сохранен/i')).toBeVisible()

  // Verify progress indicator
  await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '33')
})
```

**DC-3: Завершение и расчет результатов**
**DC-4: Просмотр результатов сессии**
**DC-5: Экспорт результатов**
**DC-6: ABC опросник flow**
**DC-7: ATEC опросник flow**
**DC-8: Vineland-3 опросник flow**
**DC-9: SPM-2 опросник flow**
**DC-10: M-CHAT-R опросник flow**
**DC-11: История сессий**
**DC-12: Редактирование незавершенной сессии**
**DC-13: Удаление сессии**
**DC-14: Сравнение результатов разных сессий**
**DC-15: Валидация обязательных вопросов**

---

## 📊 Прогресс Tracking

### Phase 1: Month 1 (15-20 тестов)
- [ ] UM-1 до UM-10 (Users Management)
- [ ] CC-1 до CC-7 (Children CRUD)
- [ ] PM-1 до PM-5 (Profile Management)

### Phase 2: Month 2 (10-15 тестов)
- [ ] RA-1 до RA-5 (Routes Advanced)
- [ ] AC-1 до AC-7 (Assignments CRUD)

### Phase 3: Month 3 (10-15 тестов)
- [ ] RL-1 до RL-7 (Reports List)
- [ ] AD-1 до AD-7 (Analytics Dashboard)

### Phase 4: Diagnostics (15 тестов)
- [ ] DC-1 до DC-15 (Diagnostics Complete)

**Всего:** ~50-65 новых тестов

---

## 🛠️ Технические Требования

### Перед началом Phase 1:

1. **Добавить data-testid в компоненты:**
   ```bash
   # Users page components
   - add-user-button
   - edit-user-button
   - delete-user-button
   - user-card
   - role-filter
   - search-input

   # Children components
   - add-child-button
   - view-child-button
   - edit-child-button
   - delete-child-button
   - child-card
   - search-children-input

   # Reports components
   - report-card
   - child-name
   - assignment-name
   - report-date
   - report-status
   ```

2. **Обновить seed данные:**
   ```typescript
   // Add more test users
   - 2-3 test parents with deletable flag
   - 1-2 test specialists
   - 5-7 test children with different statuses
   - 10-15 test reports with various statuses
   - 3-5 test diagnostic sessions (incomplete and completed)
   ```

3. **Создать helper functions:**
   ```typescript
   // test-helpers.ts
   export async function loginAs(page, email, password) { ... }
   export async function clearStorage(page) { ... }
   export async function waitForApiCall(page, urlPattern) { ... }
   export async function fillChildForm(page, childData) { ... }
   ```

4. **Настроить test fixtures:**
   ```typescript
   // fixtures.ts
   export const testUsers = {
     admin: { email: 'admin@neiro.dev', password: 'admin123' },
     specialist: { email: 'specialist1@example.com', password: 'admin123' },
     parent: { email: 'parent1@example.com', password: 'parent123' }
   }
   ```

---

## 🎯 Success Criteria

После завершения всех фаз:
- ✅ Добавлено 50-65 новых E2E тестов
- ✅ Общее количество тестов: ~154-169
- ✅ Целевой pass rate: 90%+
- ✅ Покрытие критического функционала Month 1-3: 80%+
- ✅ Diagnostics Service: 100% покрытие основного flow

---

## 📝 Next Steps

После завершения P0 тестов:
1. Запустить полный E2E suite
2. Проанализировать результаты
3. Исправить падающие тесты
4. Перейти к P1 тестам (Exercises Management, MediaUploader Advanced, Notifications Center)

---

**Статус:** READY TO START
**Начать с:** Phase 1 - Users Management (UM-1)
