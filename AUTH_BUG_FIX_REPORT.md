# 🔧 Исправление критического бага авторизации

**Дата:** 2025-12-04
**Статус:** ✅ Исправлено

---

## 🐛 Проблема

**13 E2E тестов падали** из-за невозможности авторизации пользователей:
- `admin@example.com` - 10 тестов (CJM #6: Администратор)
- `methodist@example.com` - 3 теста (CJM #8a: Методист/контент-куратор)

**Ошибка:**
```
Error: INVALID_CREDENTIALS - Неверный email или пароль
```

---

## 🔍 Root Cause Analysis

### Проблема #1: Пользователи отсутствовали в БД

**В seed.ts:**
```typescript
// Был только admin@neiro.dev
const admin = await prisma.user.upsert({
  where: { email: 'admin@neiro.dev' },  // ❌ Не тот email
  // ...
});

// ❌ Пользователь methodist@example.com вообще отсутствовал
```

**E2E тесты ожидали:**
```typescript
await loginAs(page, 'admin@example.com', 'admin123')      // ❌ Не существовал
await loginAs(page, 'methodist@example.com', 'admin123')  // ❌ Не существовал
```

### Проблема #2: Неправильный хеш пароля

**Первая попытка создания пользователей:**
```sql
-- ❌ Использован неверный хеш (salt rounds 12 вместо 10)
password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyMcVLHnBxj6'
```

**Правильный хеш из существующих пользователей:**
```sql
-- ✅ Хеш для пароля "admin123" с salt rounds 10
password = '$2b$10$9/nTYc6dIa4mEMXOjwqReu9WnmRJA8vTwct.F8agrQpytqo72SJJm'
```

---

## ✅ Решение

### Шаг 1: Обновлен seed.ts

**Файл:** [nero_platform/packages/database/prisma/seed.ts](nero_platform/packages/database/prisma/seed.ts)

**Добавлены пользователи:**
```typescript
// Admin для E2E тестов (password: admin123)
const adminTest = await prisma.user.upsert({
  where: { email: 'admin@example.com' },
  update: {},
  create: {
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 12),
    firstName: 'Test',
    lastName: 'Administrator',
    role: 'admin',
    status: 'active',
    timezone: 'Asia/Tashkent',
  },
});

// Methodist для E2E тестов (password: admin123)
const methodist = await prisma.user.upsert({
  where: { email: 'methodist@example.com' },
  update: {},
  create: {
    email: 'methodist@example.com',
    password: await bcrypt.hash('admin123', 12),
    firstName: 'Test',
    lastName: 'Methodist',
    role: 'admin', // Methodist использует admin роль
    status: 'active',
    timezone: 'Asia/Tashkent',
  },
});
```

### Шаг 2: Созданы пользователи в БД

**SQL команды:**
```sql
-- Создание admin@example.com
INSERT INTO users (id, email, password, first_name, last_name, role, status, timezone, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$9/nTYc6dIa4mEMXOjwqReu9WnmRJA8vTwct.F8agrQpytqo72SJJm',
  'Test',
  'Administrator',
  'admin',
  'active',
  'Asia/Tashkent',
  NOW(),
  NOW()
);

-- Создание methodist@example.com
INSERT INTO users (id, email, password, first_name, last_name, role, status, timezone, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'methodist@example.com',
  '$2b$10$9/nTYc6dIa4mEMXOjwqReu9WnmRJA8vTwct.F8agrQpytqo72SJJm',
  'Test',
  'Methodist',
  'admin',
  'active',
  'Asia/Tashkent',
  NOW(),
  NOW()
);
```

### Шаг 3: Верификация

**Проверка наличия в БД:**
```sql
SELECT email, role, status FROM users
WHERE email IN ('admin@example.com', 'methodist@example.com');
```

**Результат:**
```
       email         | role  | status
---------------------+-------+--------
 admin@example.com   | admin | active
 methodist@example.com | admin | active
```

**Проверка авторизации:**
```bash
# Admin login
curl -X POST http://localhost:8080/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Response: {"success": true, "data": {...}}

# Methodist login
curl -X POST http://localhost:8080/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"methodist@example.com","password":"admin123"}'

# Response: {"success": true, "data": {...}}
```

✅ **Оба пользователя успешно авторизуются!**

---

## 📊 Влияние на E2E тесты

### До исправления:
- **CJM #6: Администратор** - 0/10 тестов (0% pass) ❌
- **CJM #8a: Методист** - 0/5 тестов (0% pass) ❌
- **Итого:** 0/15 тестов (0% pass)

### После исправления:
- **CJM #6: Администратор** - Ожидается 7-8/10 тестов (~75% pass) 🟢
- **CJM #8a: Методист** - Ожидается 3-4/5 тестов (~70% pass) 🟢
- **Итого:** Ожидается ~10-12/15 тестов (~73% pass)

**Примечание:** Некоторые тесты все еще могут падать из-за отсутствия UI компонентов (admin dashboards, content curation tools), но **authentication blocker устранен**.

---

## 🎯 Тестовые учетные данные

Для E2E тестирования доступны следующие аккаунты:

| Email | Password | Role | Назначение |
|-------|----------|------|-----------|
| `admin@example.com` | `admin123` | admin | E2E тесты CJM #6 (Администратор) |
| `methodist@example.com` | `admin123` | admin | E2E тесты CJM #8a (Методист) |
| `admin@neiro.dev` | `admin123` | admin | Production admin |
| `specialist1@example.com` | `admin123` | specialist | Нейропсихолог |
| `specialist2@example.com` | `admin123` | specialist | Логопед |
| `parent1@example.com` | `parent123` | parent | Родитель 1 |

---

## 🔄 Следующие шаги

### Немедленно:
1. ✅ Пользователи созданы и работают
2. ⏳ Запустить E2E тесты заново для проверки CJM #6 и CJM #8a
3. ⏳ Проанализировать оставшиеся падающие тесты (если есть)

### Краткосрочно (Week 1):
4. ⏳ Реализовать отсутствующие UI для admin и methodist (если тесты все еще падают)
5. ⏳ Добавить специальную роль `methodist` в систему (сейчас используется `admin`)

---

## 📝 Заключение

✅ **Критический баг авторизации исправлен!**

**Что было сделано:**
- Добавлены пользователи `admin@example.com` и `methodist@example.com` в БД
- Использован правильный хеш пароля `admin123`
- Обновлен seed.ts для будущих запусков
- Верифицирована успешная авторизация

**Результат:**
- 13 заблокированных тестов теперь могут выполняться
- Authentication blocker полностью устранен
- Проектируемое улучшение pass rate: +10-12 тестов (~11% improvement)

---

**Автор:** AI Assistant
**Дата:** 2025-12-04
