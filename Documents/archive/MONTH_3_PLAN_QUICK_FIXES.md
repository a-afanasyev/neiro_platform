# MONTH_3_PLAN.md Quick Fixes

**Дата:** 22 ноября 2025
**Цель:** Исправить 5 критических блокеров перед Week 1

---

## Fix #1: Исправить опечатку MinIO (2 минуты)

**Файл:** `MONTH_3_PLAN.md`
**Строка:** 89

### Изменение:

```diff
- docker exec ninio_minio mc anonymous set none minio/neiro-reports
+ docker exec neiro_minio mc anonymous set none minio/neiro-reports
```

---

## Fix #2: Унифицировать childMood enum (15 минут)

**Файл:** `MONTH_3_PLAN.md`
**Строки:** 1224-1228

### Изменение:

```diff
  "mood": {
-   "happy": 18,
+   "good": 18,
    "neutral": 7,
-   "sad": 2
+   "difficult": 2
  }
```

### Проверить все вхождения:

```bash
# Поиск всех happy/sad
grep -n "happy\|sad" nero_platform/MONTH_3_PLAN.md

# Должно быть 0 результатов после исправления
```

---

## Fix #3: Обновить ссылки на API v0.9 (10 минут)

**Файл:** `MONTH_3_PLAN.md`
**Строки:** 1078, 1189

### Изменение 1 (строка 1078):

```diff
- ⚠️ **Примечание:** Эти endpoints будут добавлены в API_CONTRACTS_MVP.md v0.9 при финализации детализированной аналитики.
+ ✅ **Примечание:** Эти endpoints добавлены в API_CONTRACTS_MVP.md v0.9 (обновлено 22 ноября 2025).
+ **Спецификация:** См. API_CONTRACTS_MVP.md Section 11.1 (строки 859-1171):
+ - GET /analytics/v1/children/:childId/progress
+ - GET /analytics/v1/children/:childId/assignments-stats
+ - GET /analytics/v1/children/:childId/goals-progress
+ - GET /analytics/v1/children/:childId/timeline
+ - GET /analytics/v1/routes/:routeId/progress
+ - GET /analytics/v1/specialists/:specialistId/performance
```

### Изменение 2 (строка 1189):

```diff
- Детализированные endpoints отсутствуют в API_CONTRACTS_MVP.md v0.8 и будут добавлены в v0.9 при финализации
+ ✅ Детализированные endpoints добавлены в API_CONTRACTS_MVP.md v0.9 (22 ноября 2025)
+ См. спецификацию выше для полных request/response контрактов.
```

---

## Fix #4: Уточнить требования к миграциям (20 минут)

**Файл:** `MONTH_3_PLAN.md`
**Строки:** 216-220

### Изменение:

```diff
- #### ⚠️ ВАЖНО: Используем существующие модели!
-
- **Report, Notification, MediaAsset УЖЕ СУЩЕСТВУЮТ в schema.prisma**. Не требуется создание новых моделей или миграций для них.
+ #### ✅ Существующие модели
+
+ **Report, MediaAsset УЖЕ СУЩЕСТВУЮТ в schema.prisma** - миграции не требуются.
+
+ **Notification УЖЕ СУЩЕСТВУЕТ** с полями recipientId, template, lastError (согласно DATA_MODEL_AND_EVENTS.md v0.5).
+
+ #### ⚠️ Новые модели (требуют миграций в Week 0)
+
+ **UserNotification, NotificationPreference НЕ СУЩЕСТВУЮТ** - требуются миграции перед Week 3.
+ См. Task 0.6 ниже для DDL scripts.
```

**Добавить после строки 214:**

```markdown
### Задача 0.6: Database Migrations для Month 3
**Приоритет:** P0
**Владелец:** Database Team
**Оценка:** 4 часа
**Deadline:** До начала Week 3

#### Миграции

**Migration 0006_user_notifications.sql:**
```sql
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  link VARCHAR(255),
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_notifications_user_status ON user_notifications(user_id, status);
CREATE INDEX idx_user_notifications_user_created ON user_notifications(user_id, created_at DESC);
```

**Migration 0007_notification_preferences.sql:**
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  quiet_hours JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
```

#### Prisma Schema Updates

Добавить в `schema.prisma`:

```prisma
model UserNotification {
  id             String    @id @default(uuid()) @db.Uuid
  userId         String    @map("user_id") @db.Uuid
  notificationId String?   @map("notification_id") @db.Uuid
  type           String    @db.VarChar(50)
  title          String    @db.VarChar(150)
  body           String    @db.Text
  link           String?   @db.VarChar(255)
  status         String    @default("unread") @db.VarChar(20)
  readAt         DateTime? @map("read_at") @db.Timestamptz(6)
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  notification   Notification? @relation(fields: [notificationId], references: [id], onDelete: SetNull)

  @@index([userId, status])
  @@index([userId, createdAt])
  @@map("user_notifications")
}

model NotificationPreference {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @unique @map("user_id") @db.Uuid
  preferences Json     @default("{}") @db.JsonB
  quietHours  Json?    @map("quiet_hours") @db.JsonB
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}
```

#### Acceptance Criteria
- [ ] DDL scripts созданы в `packages/database/migrations/`
- [ ] Миграции применены в dev окружении
- [ ] `prisma db push` выполнен успешно
- [ ] `prisma generate` создал типы для новых моделей
- [ ] Seed данные созданы (5 test user_notifications, 3 preferences)
- [ ] Rollback scripts протестированы
- [ ] Foreign keys валидны
- [ ] Indexes созданы и проверены с EXPLAIN ANALYZE
```

---

## Fix #5: Добавить acceptance criteria для Week 3 (15 минут)

**Файл:** `MONTH_3_PLAN.md`
**Добавить после описания моделей (строка 381):**

```markdown
#### Acceptance Criteria для UserNotification Integration

**Database:**
- [ ] Таблица user_notifications создана и проиндексирована
- [ ] Таблица notification_preferences создана
- [ ] Seed данные для 3 типов уведомлений
- [ ] Foreign keys работают корректно

**EventOutbox Integration:**
- [ ] Consumer создаёт UserNotification при событии reports.report.submitted
- [ ] Consumer создаёт UserNotification при событии assignments.assignment.created
- [ ] Проверка preferences перед созданием UserNotification
- [ ] Quiet hours учитываются (no notifications during quiet period)

**API Endpoints:**
- [ ] GET /user-notifications/v1 возвращает список с пагинацией
- [ ] GET /user-notifications/v1/:id возвращает детали
- [ ] PATCH /user-notifications/v1/:id/read обновляет status и readAt
- [ ] PATCH /user-notifications/v1/read-all работает (batch update)
- [ ] DELETE /user-notifications/v1/:id архивирует (status → archived)
- [ ] GET /notification-preferences/v1 возвращает preferences с defaults
- [ ] PATCH /notification-preferences/v1 валидирует и обновляет

**Tests:**
- [ ] Unit tests: NotificationService.createUserNotification()
- [ ] Integration test: EventOutbox → UserNotification flow
- [ ] Integration test: Preferences filtering работает
- [ ] E2E test N-1: "Parent видит уведомление после создания assignment"
- [ ] E2E test N-2: "Specialist изменяет preferences, уведомления не приходят"
- [ ] E2E test N-3: "Mark all as read обновляет счётчик"

**Performance:**
- [ ] Query с userId + status использует index
- [ ] EXPLAIN ANALYZE показывает Index Scan (не Seq Scan)
- [ ] Batch update /read-all выполняется <100ms для 1000 notifications

**Cleanup:**
- [ ] Cron job архивирует notifications старше 30 дней
- [ ] Archived notifications удаляются через 90 дней
```

---

## Validation Checklist

После применения всех fixes:

```bash
# 1. Проверить опечатки
grep -n "ninio_minio" nero_platform/MONTH_3_PLAN.md
# Ожидается: 0 результатов

# 2. Проверить childMood
grep -n "happy\|sad" nero_platform/MONTH_3_PLAN.md | grep -v "# " | grep -v unhappy
# Ожидается: 0 результатов (кроме комментариев)

# 3. Проверить ссылки на API
grep -n "v0.8" nero_platform/MONTH_3_PLAN.md
# Ожидается: 0 результатов или только исторические упоминания

# 4. Проверить миграции упомянуты
grep -n "0006_user_notifications" nero_platform/MONTH_3_PLAN.md
# Ожидается: 1+ результатов

# 5. Проверить acceptance criteria
grep -c "Acceptance Criteria" nero_platform/MONTH_3_PLAN.md
# Ожидается: увеличение на 1
```

---

## Estimated Time

| Fix | Time | Difficulty |
|-----|------|------------|
| #1 MinIO typo | 2 min | Trivial |
| #2 childMood enum | 15 min | Easy |
| #3 API v0.9 refs | 10 min | Easy |
| #4 Migrations clarity | 20 min | Medium |
| #5 Acceptance criteria | 15 min | Medium |
| **Total** | **62 min** | **~1 hour** |

---

## Priority Order

1. **Fix #1** (MinIO typo) - блокирует Week 0
2. **Fix #4** (Migrations) - блокирует Week 3
3. **Fix #2** (childMood) - блокирует Week 2 Analytics
4. **Fix #3** (API refs) - блокирует Week 2 development
5. **Fix #5** (Acceptance) - улучшает clarity Week 3

---

## Result

После применения всех fixes:

✅ Week 0 может завершиться (MinIO setup работает)
✅ Week 2 Analytics имеет спецификацию (API v0.9)
✅ Week 3 Notifications готов к старту (миграции, acceptance criteria)
✅ Data integrity гарантирована (единый childMood enum)
✅ Нет technical debt

**Status:** READY FOR WEEK 1

---

**Created by:** Claude Code
**Date:** 22 ноября 2025
**Validation:** Run checklist above after applying fixes
