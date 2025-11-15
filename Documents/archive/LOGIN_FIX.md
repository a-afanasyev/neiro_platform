# Исправление проблемы с логином

## Проблема

Обнаружена критическая проблема в процессе логина, которая полностью блокировала возможность входа пользователей:

### 1. Несовместимость форматов API ответов

**Бэкенд** (`services/auth/src/controllers/auth.controller.ts`) возвращал:
```typescript
{
  accessToken: "...",
  refreshToken: "...",
  expiresIn: 900,
  user: { ... }
}
```

**Фронтенд** (`apps/web/src/app/login/page.tsx`) ожидал:
```typescript
{
  success: true,
  data: {
    accessToken: "...",
    refreshToken: "...",
    user: { ... }
  }
}
```

Из-за этого проверка `if (response.success)` всегда возвращала `false`, и логин не работал.

### 2. Неправильные редиректы

Фронтенд пытался редиректить на несуществующие роуты:
- `/dashboard/admin`
- `/dashboard/specialist`
- `/dashboard/parent`

При этом существовал только единый роут `/dashboard`.

### 3. Неправильная проверка ролей

Код проверял роли в UPPERCASE (`'ADMIN'`, `'SPECIALIST'`), но в базе данных роли хранятся в lowercase (`'admin'`, `'specialist'`, `'parent'`, `'supervisor'`).

## Решение

### 1. Приведение к единому формату API

Обновлены оба endpoint в `services/auth/src/controllers/auth.controller.ts`:

#### Login endpoint:
```typescript
res.status(200).json({
  success: true,
  data: {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    },
  },
});
```

#### Refresh endpoint:
```typescript
res.status(200).json({
  success: true,
  data: {
    accessToken,
    expiresIn: 15 * 60,
  },
});
```

### 2. Упрощение логики редиректов

В `apps/web/src/app/login/page.tsx` убрана проверка ролей и редиректы на несуществующие роуты:

**Было:**
```typescript
if (user.role === 'ADMIN') {
  router.push('/dashboard/admin')
} else if (user.role === 'SPECIALIST' || user.role === 'SUPERVISOR') {
  router.push('/dashboard/specialist')
} else if (user.role === 'PARENT') {
  router.push('/dashboard/parent')
} else {
  router.push('/dashboard')
}
```

**Стало:**
```typescript
// Редирект на единый dashboard (роли lowercase из базы)
router.push('/dashboard')
```

### 3. Обновление API клиента

В `apps/web/src/lib/api.ts` обновлен обработчик refresh токенов:

**Было:**
```typescript
const { accessToken } = response.data
```

**Стало:**
```typescript
const { accessToken } = response.data.data
```

## Результат

✅ Логин теперь работает корректно
✅ Единый формат API ответов согласно типу `ApiResponse<T>`
✅ Правильная обработка refresh токенов
✅ Корректный редирект после логина

## Тестовые аккаунты

После исправлений можно использовать следующие тестовые аккаунты:

| Email | Пароль | Роль |
|-------|--------|------|
| admin@neiro.dev | admin123 | admin |
| supervisor@neiro.dev | supervisor123 | supervisor |
| specialist1@neiro.dev | specialist123 | specialist |
| parent1@neiro.dev | parent123 | parent |

## Дальнейшие шаги

1. ✅ Применить патч безопасности v0.3.1
2. ✅ Запустить тесты логина
3. ⏳ Реализовать role-based UI для dashboard (в будущих итерациях)
4. ⏳ Добавить индивидуальные dashboard для каждой роли

## Версия

**Патч:** 0.3.2
**Дата:** 2025-11-14
**Критичность:** CRITICAL

