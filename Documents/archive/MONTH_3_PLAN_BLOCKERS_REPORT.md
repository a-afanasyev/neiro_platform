# MONTH_3_PLAN.md Critical Blockers Report

**Дата анализа:** 22 ноября 2025
**Версия MONTH_3_PLAN.md:** v2.4
**Статус:** 🔴 **5 CRITICAL BLOCKERS FOUND**

---

## Executive Summary

Обнаружено **5 критических блокеров**, которые могут сорвать начало разработки Month 3:

1. 🔴 **Противоречие о миграциях** - план заявляет "миграции не нужны", но требует добавить поля
2. 🔴 **Опечатка в критичной команде** - MinIO setup команда не выполнится
3. 🔴 **Analytics без спецификации** - разработка планируется без API контракта
4. 🔴 **Inconsistent childMood enum** - `happy/sad` vs `good/difficult` приведет к data corruption
5. 🔴 **Отсутствие acceptance criteria** - новые модели без тестов/валидации

**Рекомендация:** Исправить все блокеры до начала Week 1.

---

## 🔴 BLOCKER #1: Противоречие о необходимости миграций

### Локация
- **Строки 216-220:** Утверждение "не требуется создание новых моделей или миграций"
- **Строка 320:** "⚠️ Требуется миграция: Добавить поля recipientId, template, lastError"
- **Строки 322-381:** "Эта модель НЕ СУЩЕСТВУЕТ - требуется создать миграцию"

### Проблема

**Противоречивые утверждения:**
```markdown
Строка 218: "Report, Notification, MediaAsset УЖЕ СУЩЕСТВУЮТ в schema.prisma.
Не требуется создание новых моделей или миграций для них."

Строка 320: "⚠️ Требуется миграция: Добавить поля recipientId, template, lastError
в существующую таблицу notifications."

Строка 324: "**Эта модель НЕ СУЩЕСТВУЕТ** - требуется создать миграцию в Week 3"
```

### Влияние

**CRITICAL - блокирует Week 3 (Notifications Service):**

1. **Неясно, какие миграции нужны:**
   - Нужно ли ALTER TABLE notifications?
   - Когда создавать user_notifications?
   - Когда создавать notification_preferences?

2. **Нет владельца миграций:**
   - Кто пишет DDL?
   - Кто тестирует миграции?
   - Кто делает rollback план?

3. **Нет графика выполнения:**
   - Week 0, 1, 2 или 3?
   - До или после разработки сервиса?
   - Как тестировать без схемы?

### Требуемые миграции

#### Migration 1: ALTER TABLE notifications (Week 0/1)

**Текущая схема (DATA_MODEL_AND_EVENTS.md:696-708):**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  recipient_id UUID NOT NULL,  -- ✅ УЖЕ ЕСТЬ
  channel VARCHAR(50) NOT NULL,
  template VARCHAR(100) NOT NULL,  -- ✅ УЖЕ ЕСТЬ
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  attempts INT DEFAULT 0,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  last_error TEXT,  -- ✅ УЖЕ ЕСТЬ
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Вывод:** Поля recipientId, template, lastError **УЖЕ СУЩЕСТВУЮТ** согласно DATA_MODEL_AND_EVENTS.md!

**Проблема:** MONTH_3_PLAN.md содержит устаревшую информацию о schema.

#### Migration 2: CREATE TABLE user_notifications (Week 3)

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_notifications_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_user_notifications_user_status ON user_notifications(user_id, status);
CREATE INDEX idx_user_notifications_user_created ON user_notifications(user_id, created_at DESC);
```

#### Migration 3: CREATE TABLE notification_preferences (Week 3)

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  quiet_hours JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT notification_preferences_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
```

**Формат preferences JSONB:**
```json
{
  "assignment_reminder": { "email": true, "push": true, "telegram": false, "inApp": true },
  "report_ready": { "email": true, "push": true, "telegram": true, "inApp": true },
  "goal_achieved": { "email": false, "push": true, "telegram": false, "inApp": true }
}
```

### Решение

**Добавить в MONTH_3_PLAN.md Week 0:**

```markdown
### Задача 0.6: Database Migrations для Month 3
**Приоритет:** P0
**Владелец:** Database Team
**Оценка:** 4 часа

#### DDL Scripts

**Migration 1: user_notifications table**
- Файл: `packages/database/migrations/0006_user_notifications.sql`
- Выполнить: Week 0 (до начала Week 3)
- Rollback: DROP TABLE user_notifications CASCADE;

**Migration 2: notification_preferences table**
- Файл: `packages/database/migrations/0007_notification_preferences.sql`
- Выполнить: Week 0 (до начала Week 3)
- Rollback: DROP TABLE notification_preferences CASCADE;

#### Acceptance Criteria
- [ ] DDL scripts созданы и проверены
- [ ] Миграции применены в dev окружении
- [ ] Prisma schema обновлена
- [ ] prisma generate выполнен успешно
- [ ] Rollback протестирован
- [ ] Seed данные созданы для тестирования
```

---

## 🔴 BLOCKER #2: Опечатка в критичной команде MinIO setup

### Локация
**Строка 89:** `docker exec ninio_minio mc anonymous set none minio/neiro-reports`

### Проблема

**Typo в имени контейнера:**
```bash
# ❌ НЕПРАВИЛЬНО (строка 89)
docker exec ninio_minio mc anonymous set none minio/neiro-reports

# ✅ ПРАВИЛЬНО
docker exec neiro_minio mc anonymous set none minio/neiro-reports
```

**Ошибка:** `ninio_minio` → `neiro_minio`

### Влияние

**HIGH - блокирует Week 0 (Prerequisites):**

1. **Команда не выполнится:**
   ```bash
   Error response from daemon: No such container: ninio_minio
   ```

2. **MinIO buckets не настроены:**
   - `neiro-reports` bucket остаётся публичным
   - Security vulnerability - все отчёты доступны публично!

3. **Week 0 acceptance criteria не пройдёт:**
   - Task 0.1.1: "MinIO buckets созданы" - FALSE
   - Не можем начинать Week 1

### Решение

**Исправить строку 89:**
```diff
- docker exec ninio_minio mc anonymous set none minio/neiro-reports
+ docker exec neiro_minio mc anonymous set none minio/neiro-reports
```

---

## 🔴 BLOCKER #3: Analytics Service без API спецификации

### Локация
- **Строки 1187-1199:** "endpoints отсутствуют в API_CONTRACTS_MVP.md v0.8"
- **Строка 1078:** "⚠️ Примечание: Эти endpoints будут добавлены в API_CONTRACTS_MVP.md v0.9"

### Проблема

**Разработка без спецификации:**

1. **План ссылается на v0.8:**
   ```markdown
   Строка 1189: "Детализированные endpoints отсутствуют в API_CONTRACTS_MVP.md v0.8
   и будут добавлены в v0.9 при финализации"
   ```

2. **API_CONTRACTS_MVP.md уже v0.9 (обновлено 22 ноября 2025):**
   - Analytics endpoints **УЖЕ ДОБАВЛЕНЫ** в Section 11.1
   - MONTH_3_PLAN.md содержит устаревшую информацию

3. **Несоответствие структуры response:**
   ```javascript
   // MONTH_3_PLAN.md (строка 1224-1228) - УСТАРЕВШЕЕ
   "mood": {
     "happy": 18,
     "neutral": 7,
     "sad": 2
   }

   // API_CONTRACTS_MVP.md v0.9 - АКТУАЛЬНОЕ
   "performance": {
     "avgChildMood": "good|neutral|difficult"  // НЕ happy/sad!
   }
   ```

### Влияние

**HIGH - блокирует Week 2 (Analytics Service):**

1. **Разработка без спецификации:**
   - Backend developers не знают точную структуру response
   - Frontend ожидает один формат, backend возвращает другой

2. **Невозможно писать тесты:**
   - Что валидировать в response?
   - Какие поля обязательные?

3. **Code review без эталона:**
   - Reviewer не может проверить соответствие API контракту

### Решение

**Обновить MONTH_3_PLAN.md:**

1. **Убрать ссылки на v0.8:**
   ```diff
   - Детализированные endpoints отсутствуют в API_CONTRACTS_MVP.md v0.8
   + ✅ Детализированные endpoints добавлены в API_CONTRACTS_MVP.md v0.9 (22.11.2025)
   ```

2. **Обновить примеры response на актуальные из v0.9:**
   ```diff
   - "mood": {
   -   "happy": 18,
   -   "neutral": 7,
   -   "sad": 2
   - }
   + "performance": {
   +   "avgChildMood": "good",
   +   "avgCompletionQuality": 85.5,
   +   "consistencyScore": 0.82
   + }
   ```

3. **Добавить ссылки на конкретные разделы:**
   ```markdown
   **API Спецификация:** API_CONTRACTS_MVP.md v0.9 Section 11.1:
   - GET /analytics/v1/children/:childId/progress (строки 859-902)
   - GET /analytics/v1/children/:childId/assignments-stats (строки 904-959)
   - GET /analytics/v1/children/:childId/goals-progress (строки 961-1021)
   ```

---

## 🔴 BLOCKER #4: Inconsistent childMood enum values

### Локация

**Несоответствие в 3 местах:**

1. **DATA_MODEL_AND_EVENTS.md (canonical):** `good | neutral | difficult`
2. **API_CONTRACTS_MVP.md v0.9:** `good | neutral | difficult`
3. **MONTH_3_PLAN.md строка 1224-1228:** `happy | neutral | sad`

### Проблема

**Data corruption risk:**

```typescript
// Backend сохраняет (согласно schema.prisma:231)
childMood: "good"

// Analytics aggregation возвращает (MONTH_3_PLAN.md:1224-1228)
"mood": {
  "happy": 0,  // ❌ Нет записей с "happy"
  "neutral": 7,
  "sad": 0     // ❌ Нет записей с "sad"
}

// Frontend отображает пустой график!
```

### Влияние

**CRITICAL - data integrity:**

1. **Аналитика не работает:**
   - Графики пустые (ищет "happy", а в БД "good")
   - Неправильные статистики

2. **Validation errors:**
   ```typescript
   // Zod schema (packages/types/reports.ts)
   childMood: z.enum(["good", "neutral", "difficult"])

   // Если analytics возвращает "happy" → validation fails
   ```

3. **Incompatible UI:**
   - Icons/colors настроены на "good/difficult"
   - Переводы для "good/neutral/difficult"
   - UX consistency нарушена

### Canonical Values (из SoT)

**ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md, DATA_MODEL_AND_EVENTS.md, API_CONTRACTS_MVP.md:**
```
childMood: "good" | "neutral" | "difficult"
```

**Rationale:**
- "good" - позитивное, без эмоциональной окраски
- "difficult" - нейтральное описание трудностей
- Избегаем subjective "happy/sad"

### Решение

**Заменить ВСЕ упоминания `happy/sad` на `good/difficult`:**

**MONTH_3_PLAN.md строки 1224-1228:**
```diff
  "mood": {
-   "happy": 18,
+   "good": 18,
    "neutral": 7,
-   "sad": 2
+   "difficult": 2
  }
```

**Проверить все файлы:**
```bash
grep -rn "happy.*neutral.*sad" nero_platform/
grep -rn "childMood.*happy" nero_platform/
```

---

## 🔴 BLOCKER #5: Отсутствие acceptance criteria для новых моделей

### Локация
**Строки 330-381:** Описание моделей UserNotification и NotificationPreference без acceptance criteria

### Проблема

**Нет exit criteria для Week 3:**

1. **UserNotification модель:**
   - ❌ Нет acceptance criteria
   - ❌ Не указано, когда создавать миграцию
   - ❌ Нет seed данных для тестирования
   - ❌ Нет связки с EventOutbox

2. **NotificationPreference модель:**
   - ❌ Нет default values стратегии
   - ❌ Нет миграции для существующих пользователей
   - ❌ Нет UI для настройки preferences

3. **Интеграция не описана:**
   - Как UserNotification создается при EventOutbox event?
   - Как проверяются preferences перед отправкой?
   - Как архивируются старые уведомления?

### Влияние

**HIGH - Week 3 не готов к началу:**

1. **Непонятно, когда Week 3 считается завершённой:**
   - Какие тесты должны проходить?
   - Какая UI должна работать?

2. **Риск scope creep:**
   - Без чётких границ разработка может затянуться
   - Нет критериев для code review

3. **E2E tests не написаны:**
   - Что тестировать?
   - Какие user flows покрывать?

### Решение

**Добавить в MONTH_3_PLAN.md Week 3:**

```markdown
### Задача 3.X: UserNotification Integration with EventOutbox

#### Acceptance Criteria

**Database:**
- [ ] Миграция user_notifications применена
- [ ] Миграция notification_preferences применена
- [ ] Seed данные созданы для 3 типов уведомлений
- [ ] Foreign keys корректны (userId → users, notificationId → notifications)

**Backend Integration:**
- [ ] EventOutbox consumer создаёт UserNotification при событии
- [ ] Проверка preferences перед созданием UserNotification
- [ ] Soft delete (status → archived) вместо DELETE
- [ ] Cleanup job для старых (>30 дней) archived уведомлений

**API Endpoints:**
- [ ] GET /user-notifications/v1 возвращает корректный список
- [ ] PATCH /:id/read обновляет status и readAt
- [ ] PATCH /read-all работает (batch update)
- [ ] DELETE /:id архивирует (не удаляет)

**Preferences:**
- [ ] GET /notification-preferences/v1 возвращает defaults для новых users
- [ ] PATCH /notification-preferences/v1 валидирует структуру
- [ ] Quiet hours правильно парсятся (timezone support)

**Tests:**
- [ ] Unit tests для NotificationService
- [ ] Integration tests для EventOutbox → UserNotification flow
- [ ] E2E test: "Parent видит уведомление в UI после создания assignment"
- [ ] E2E test: "Specialist изменяет preferences, уведомления не приходят"

**UI (если в scope):**
- [ ] Notification bell показывает unread count
- [ ] Dropdown список уведомлений
- [ ] Mark as read работает
- [ ] Link навигация работает
```

---

## Priority Matrix

| Blocker | Priority | Complexity | Owner | Week |
|---------|----------|------------|-------|------|
| #1 Migrations | 🔴 P0 | Medium | Database Team | Week 0 |
| #2 MinIO typo | 🔴 P0 | Trivial | DevOps | Week 0 |
| #3 Analytics spec | 🟡 P1 | Low | Tech Lead | Week 0/1 |
| #4 childMood enum | 🔴 P0 | Low | Tech Lead | Week 0 |
| #5 Acceptance criteria | 🟡 P1 | Medium | PM + Tech Lead | Week 0 |

---

## Action Items

### Immediate (перед Week 1):

1. **Исправить опечатку MinIO** (2 мин)
   ```bash
   # В MONTH_3_PLAN.md строка 89
   s/ninio_minio/neiro_minio/
   ```

2. **Создать DDL migrations** (4 часа)
   - `0006_user_notifications.sql`
   - `0007_notification_preferences.sql`
   - Тестировать + rollback scripts

3. **Унифицировать childMood** (1 час)
   - Найти все `happy/sad` в MONTH_3_PLAN.md
   - Заменить на `good/difficult`
   - Проверить consistency

4. **Обновить ссылки на API v0.9** (30 мин)
   - Убрать упоминания v0.8
   - Добавить ссылки на конкретные строки v0.9

### Short-term (Week 0):

5. **Добавить acceptance criteria** (2 часа)
   - Для UserNotification integration
   - Для NotificationPreference
   - Для EventOutbox consumers

6. **Создать Week 0 задачу для миграций** (1 час)
   - DDL scripts
   - Seed data
   - Prisma schema update

### Validation:

7. **Запустить compliance check:**
   ```bash
   grep -n "happy\|sad" MONTH_3_PLAN.md
   grep -n "ninio_minio" MONTH_3_PLAN.md
   grep -n "v0.8" MONTH_3_PLAN.md
   ```

---

## Estimated Impact

**Если НЕ исправить:**

- ❌ Week 0 не может завершиться (MinIO setup fails)
- ❌ Week 2 разработка без спецификации (rework потребуется)
- ❌ Week 3 не может начаться (нет миграций, нет acceptance criteria)
- ❌ Data corruption в production (wrong childMood enum)

**Общая задержка:** 2-3 недели

**Если исправить сейчас:**

- ✅ Week 0 завершается по плану
- ✅ Week 1-3 чёткие границы и acceptance criteria
- ✅ Нет technical debt
- ✅ Data integrity гарантирована

**Время на исправление:** ~8 часов

---

## Recommendations

1. **Назначить владельцев:**
   - Database migrations: Database Team
   - API sync: Tech Lead
   - Acceptance criteria: PM + Tech Lead

2. **Добавить в Week 0:**
   - Task 0.6: Database Migrations
   - Task 0.7: MONTH_3_PLAN.md corrections

3. **Создать checklist перед Week 1:**
   ```markdown
   - [ ] Все 5 blockers исправлены
   - [ ] DDL миграции протестированы
   - [ ] childMood enum единый везде
   - [ ] Acceptance criteria добавлены
   - [ ] API specs синхронизированы с v0.9
   ```

---

**Prepared by:** Claude Code
**Date:** 22 ноября 2025
**Status:** 🔴 CRITICAL - Requires immediate action
