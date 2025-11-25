# МЕСЯЦ 3: ПЛАН РЕАЛИЗАЦИИ
## Neiro Platform - Reports, Analytics, Notifications

**Период:** Месяц 3
**Статус:** Planning
**Версия:** 2.4
**Дата создания:** 2025-01-21
**Последнее обновление:** 2025-01-22 (Notifications Split + Compliance)

---

## 📊 EXECUTIVE SUMMARY

### Цели Месяца 3
Завершить полный цикл взаимодействия: **Назначение → Выполнение → Отчет → Отзыв → Прогресс**

### Ключевые результаты (OKRs)
1. **Родители могут отправлять отчеты с медиа** (фото/видео) - 100% функционал
2. **Специалисты видят аналитику** по прогрессу детей с визуализацией
3. **Пользователи получают уведомления** о важных событиях (email + in-app)
4. **100% E2E test coverage** - все 53+ тестов проходят

### Метрики успеха
- ✅ 90%+ заданий выполняются вовремя (благодаря напоминаниям)
- ✅ 80%+ отчетов содержат медиа (фото/видео доказательства)
- ✅ Специалисты проверяют отчеты в течение 24 часов
- ✅ API latency < 200ms (p95)

### Новые микросервисы
1. **Reports Service** (порт 4009) - управление отчетами и медиа
2. **Analytics Service** (порт 4010) - агрегация и аналитика прогресса
3. **Notifications Service** (порт 4011) - уведомления (email + in-app)
4. **Communications Service** (порт 4012) - опционально, если успеем

---

## 🗓️ КАЛЕНДАРНЫЙ ПЛАН

```
┌─────────────┬──────────────────────────────────────────┬─────────────┐
│    Неделя   │                  Фокус                   │   Статус    │
├─────────────┼──────────────────────────────────────────┼─────────────┤
│   Week 0    │ Infrastructure Pre-work (DevOps)         │  🔧 SETUP   │
│   Week 1    │ Reports Service + File Uploads           │  📝 TODO    │
│   Week 2    │ Analytics Service + Progress Dashboards  │  📝 TODO    │
│   Week 3    │ Notifications Service + Email Delivery   │  📝 TODO    │
│   Week 4    │ Testing, Documentation, Polish           │  📝 TODO    │
└─────────────┴──────────────────────────────────────────┴─────────────┘
```

**Обновленный timeline:** 5 недель (Week 0 + 4 недели разработки)
**Критическое изменение:** Добавлен Week 0 для устранения инфраструктурных блокеров

---

## 🔗 ДИАГРАММА ЗАВИСИМОСТЕЙ ЗАДАЧ

### Week 0 → Week 1 → Week 2 → Week 3 Dependencies

```mermaid
graph TB
    subgraph Week0["🔧 WEEK 0: Infrastructure"]
        W0_1["0.1 MinIO Setup"]
        W0_2["0.2 Redis Setup"]
        W0_3["0.3 SendGrid Setup"]
        W0_4["0.4 Environment Variables"]
        W0_5["0.5 Schema Review"]
        W0_6["0.6 Database Migrations"]
    end

    subgraph Week1["📝 WEEK 1: Reports Service"]
        W1_1["1.1 Reports Service"]
        W1_2["1.2 Media Upload"]
        W1_3["1.3 Report Review"]
        W1_4["1.4 EventOutbox"]
        W1_5["1.5 Frontend"]
    end

    subgraph Week2["📊 WEEK 2: Analytics Service"]
        W2_1["2.1 Analytics Service"]
        W2_2["2.2 Progress API"]
        W2_3["2.3 Caching"]
        W2_4["2.4 Frontend Dashboards"]
    end

    subgraph Week3["📧 WEEK 3: Notifications"]
        W3_1["3.1 Notifications Service"]
        W3_2["3.2 User Notifications UI"]
        W3_3["3.3 Email Templates"]
        W3_4["3.4 SendGrid Integration"]
        W3_5["3.5 Frontend UI"]
    end

    %% Week 0 dependencies
    W0_1 --> W1_2
    W0_2 --> W2_3
    W0_3 --> W3_4
    W0_4 --> W1_1
    W0_4 --> W2_1
    W0_4 --> W3_1
    W0_5 --> W0_6
    W0_6 --> W3_2

    %% Week 1 internal
    W1_1 --> W1_2
    W1_2 --> W1_3
    W1_3 --> W1_4
    W1_4 --> W1_5

    %% Week 1 → Week 2
    W1_4 --> W2_1
    W1_1 --> W2_2

    %% Week 2 internal
    W2_1 --> W2_2
    W2_2 --> W2_3
    W2_3 --> W2_4

    %% Week 2 → Week 3
    W2_1 --> W3_1

    %% Week 3 internal
    W3_1 --> W3_2
    W3_1 --> W3_3
    W3_3 --> W3_4
    W3_4 --> W3_5
    W3_2 --> W3_5

    %% Critical path
    W1_4 -.->|EventOutbox Events| W3_1
    W0_6 -.->|UserNotification model| W3_2

    style W0_1 fill:#ff6b6b
    style W0_2 fill:#ff6b6b
    style W0_3 fill:#feca57
    style W0_6 fill:#ff6b6b
    style W1_4 fill:#4ecdc4
    style W3_2 fill:#95afc0
```

### Легенда зависимостей

🔴 **Критические блокеры (P0):**
- **0.1 MinIO** → блокирует 1.2 Media Upload
- **0.2 Redis** → блокирует 2.3 Caching
- **0.6 Migrations** → блокирует 3.2 User Notifications UI

🟡 **Важные зависимости (P1):**
- **0.3 SendGrid** → блокирует 3.4 Email Integration (но есть fallback SMTP)
- **1.4 EventOutbox** → необходим для 3.1 Notifications consumers

🔵 **Мягкие зависимости:**
- Analytics Service может работать параллельно с Reports
- Frontend страницы могут разрабатываться параллельно с backend

### Параллелизация работ

**Week 1:**
- Task 1.1 (Reports API) + Task 1.2 (Media Upload) → последовательно
- Task 1.5 (Frontend) может начаться после 1.1 (с моками)

**Week 2:**
- Task 2.1 (Analytics API) + Task 2.2 (Progress endpoints) → последовательно
- Task 2.4 (Frontend) может начаться параллельно с 2.3 (Caching)

**Week 3:**
- Task 3.1 (Notifications backend) + Task 3.2 (User Notifications) → последовательно
- Task 3.3 (Email templates) + Task 3.5 (Frontend) → могут идти параллельно

---

# 🔧 WEEK 0: INFRASTRUCTURE PRE-WORK (DEVOPS)

**Цель:** Подготовить инфраструктуру заранее, чтобы Week 1-3 не блокировались отсутствием MinIO, SendGrid, Redis конфигураций

**Трудозатраты:** 8 часов (DevOps/инфраструктурный слот)
**Приоритет:** P0 (блокер для Week 1, 2, 3)
**Когда выполнить:** До начала Week 1

---

## 0.1 MinIO Storage Configuration

### Задача 0.1.1: Создание buckets и access policies
**Приоритет:** P0
**Оценка:** 2 часа
**Блокирует:** Week 1 Task 1.1.3 (Media Upload)

#### Acceptance Criteria
- [ ] MinIO bucket `neiro-reports` создан
- [ ] MinIO bucket `neiro-reports-thumbnails` создан (для превью)
- [ ] Access policy настроена: публичное чтение для thumbnails, приватное для reports
- [ ] MinIO Client (mc) настроен локально для тестирования
- [ ] Создан `.env` с переменными: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_REPORTS`
- [ ] Проверка: `docker exec neiro_minio mc ls minio/neiro-reports` работает

#### Команды для выполнения
```bash
# 1. Создать buckets
docker exec neiro_minio mc mb minio/neiro-reports
docker exec neiro_minio mc mb minio/neiro-reports-thumbnails

# 2. Настроить политику доступа
docker exec neiro_minio mc anonymous set download minio/neiro-reports-thumbnails
docker exec neiro_minio mc anonymous set none minio/neiro-reports

# 3. Проверка
docker exec neiro_minio mc ls minio/
```

#### Технические требования
- MinIO уже развернут на порту 9000/9001 (см. docker-compose.yml)
- Консоль доступна: http://localhost:9001
- Access Key: `minioadmin` / Secret: `minioadmin123` (для dev окружения)

---

## 0.2 Redis Caching Strategy

### Задача 0.2.1: Redis configuration для Analytics cache
**Приоритет:** P0
**Оценка:** 1 час
**Блокирует:** Week 2 Task 2.1.3 (Progress Aggregation)

#### Acceptance Criteria
- [ ] Redis конфигурация с TTL политикой для analytics (5 минут)
- [ ] Redis namespace convention: `analytics:child:{childId}:progress`
- [ ] Создан `.env` с `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- [ ] Документирован cache invalidation strategy в комментариях

#### Технические требования
- Redis уже развернут на порту 6380 (внешний) / 6379 (внутренний в docker network) (см. docker-compose.yml)
- Для подключения из контейнеров использовать `redis://redis:6379`
- Для подключения с хоста использовать `redis://localhost:6380`
- Использовать `ioredis` библиотеку
- TTL для кэша: 300 секунд (5 минут)
- Invalidation: при создании нового отчета или завершении задания

---

## 0.3 Email Delivery Setup (SendGrid)

### Задача 0.3.1: SendGrid account и API key
**Приоритет:** P0
**Оценка:** 2 часа
**Блокирует:** Week 3 Task 3.1.2 (Email Templates)

#### Acceptance Criteria
- [ ] SendGrid account создан (или используется существующий)
- [ ] API Key сгенерирован с правами `Mail Send`
- [ ] Verified Sender Email настроен (например, `noreply@neiro.dev`)
- [ ] Создан `.env` с `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`
- [ ] Проверка: тестовое письмо отправлено через SendGrid API
- [ ] Fallback: если SendGrid недоступен, использовать Nodemailer + SMTP (Gmail для dev)

#### Команды для проверки
```bash
# Тест отправки через curl
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"personalizations":[{"to":[{"email":"admin@neiro.dev"}]}],"from":{"email":"noreply@neiro.dev"},"subject":"Test","content":[{"type":"text/plain","value":"Hello"}]}'
```

#### Альтернатива (если SendGrid не доступен)
- Использовать **Nodemailer + Gmail SMTP**
- Настроить App Password для Gmail аккаунта
- Конфигурация: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS`

---

## 0.4 Environment Variables & Secrets

### Задача 0.4.1: Централизованный `.env.example` для всех сервисов
**Приоритет:** P1
**Оценка:** 1 час

#### Acceptance Criteria
- [ ] Обновлен `.env.example` с переменными для Reports, Analytics, Notifications
- [ ] Документированы все обязательные переменные с комментариями
- [ ] Локальный `.env` файл обновлен (не коммитится в git)
- [ ] Все сервисы могут запуститься с новыми переменными

#### Пример структуры `.env`
```bash
# ============================================================
# MinIO Storage (Week 1 - Reports)
# ============================================================
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_REPORTS=neiro-reports
MINIO_USE_SSL=false

# ============================================================
# Redis Cache (Week 2 - Analytics)
# ============================================================
# Для подключения с хоста
REDIS_HOST=localhost
REDIS_PORT=6380
# Для подключения из контейнеров использовать: redis://redis:6379
REDIS_PASSWORD=
REDIS_ANALYTICS_TTL=300

# ============================================================
# Email Delivery (Week 3 - Notifications)
# ============================================================
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@neiro.dev
SENDGRID_FROM_NAME="Neiro Platform"
# Fallback SMTP (если SendGrid недоступен)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

---

## 0.5 Database Schema Extensions

### Задача 0.5.1: Обзор существующих моделей БД для Month 3
**Приоритет:** P0 (критично для понимания)
**Оценка:** 1 час

#### Acceptance Criteria
- [ ] Проверены существующие модели: `Report`, `Notification`, `MediaAsset`
- [ ] Документирована стратегия использования JSON полей
- [ ] Определена необходимость миграции для `NotificationPreference`

### Задача 0.6: Database Migrations для Month 3
**Приоритет:** P0
**Владелец:** Database Team
**Оценка:** 4 часа
**Deadline:** До начала Week 3
**Статус:** ✅ ВЫПОЛНЕНО (2025-01-25)

#### Архитектура: Dual-Layer Notifications System

Реализована трёхслойная архитектура уведомлений:
1. **Delivery Layer** (`notifications`) - очередь доставки email/SMS/push
2. **UI Layer** (`user_notifications`) - in-app уведомления для фронтенда
3. **Preferences Layer** (`notification_preferences`) - настройки пользователя

#### Миграции

**Migration 0008_update_notification_model.sql:**
Обновляет существующую таблицу `notifications` для Hybrid Approach:
- Добавляет `recipient_id UUID` (FK на users) для быстрых запросов
- Добавляет `template VARCHAR(100)` для типа уведомления
- Добавляет `last_error TEXT` для отладки failed notifications
- Мигрирует данные из `payload` в явные поля
- Создаёт composite indexes для производительности

```sql
-- См. packages/database/migrations/0008_update_notification_model.sql
-- Key features:
-- - ALTER TABLE notifications ADD COLUMN recipient_id, template, last_error
-- - UPDATE для миграции существующих данных
-- - CREATE INDEX idx_notifications_recipient_status
-- - CREATE INDEX idx_notifications_status_scheduled
```

**Migration 0009_create_user_notifications.sql:**
Создаёт таблицу UI layer для in-app уведомлений:
- Таблица `user_notifications` с userId, type, title, body, link, status, readAt
- Автоматический trigger для установки `read_at` при изменении status на 'read'
- View `user_notification_counts` для подсчёта непрочитанных
- Полиморфная связь с `notifications` (опциональный FK)

```sql
-- См. packages/database/migrations/0009_create_user_notifications.sql
-- Key features:
-- - CREATE TABLE user_notifications с UI-специфичными полями
-- - CREATE FUNCTION set_user_notification_read_at() для auto read_at
-- - CREATE VIEW user_notification_counts для быстрого подсчёта
-- - CREATE INDEX для (user_id, status, created_at) queries
```

**Migration 0010_create_notification_preferences.sql:**
Создаёт таблицу настроек уведомлений:
- Таблица `notification_preferences` с JSONB для гибких настроек
- Функция `get_default_notification_preferences()` для дефолтных значений
- Автоматический trigger для создания preferences при регистрации пользователя
- Функция `is_notification_allowed()` для проверки разрешений и quiet hours

```sql
-- См. packages/database/migrations/0010_create_notification_preferences.sql
-- Key features:
-- - CREATE TABLE notification_preferences с preferences JSONB
-- - CREATE FUNCTION create_default_notification_preferences()
-- - CREATE TRIGGER на users для auto-создания preferences
-- - CREATE FUNCTION is_notification_allowed(user_id, type, channel, time)
```

#### Prisma Schema Updates

**✅ ВЫПОЛНЕНО:** schema.prisma обновлён (lines 694-763)

Добавлены три модели с dual-layer архитектурой:

```prisma
// Delivery Layer
model Notification {
  id          String    @id @default(uuid()) @db.Uuid
  recipientId String    @map("recipient_id") @db.Uuid  // NEW: Explicit field
  channel     String    @db.VarChar(50)
  template    String?   @db.VarChar(100)              // NEW: Explicit field
  payload     Json      @db.JsonB
  status      String    @default("pending") @db.VarChar(20)
  attempts    Int       @default(0)
  lastError   String?   @map("last_error") @db.Text  // NEW: Explicit field
  scheduledAt DateTime  @map("scheduled_at") @db.Timestamptz(6)
  sentAt      DateTime? @map("sent_at") @db.Timestamptz(6)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  recipient         User               @relation("NotificationRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  userNotifications UserNotification[]

  @@index([recipientId, status])
  @@index([status, scheduledAt])
  @@map("notifications")
}

// UI Layer
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

  user         User          @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  notification Notification? @relation(fields: [notificationId], references: [id], onDelete: SetNull)

  @@index([userId, status, createdAt])
  @@index([userId, createdAt])
  @@map("user_notifications")
}

// Preferences Layer
model NotificationPreference {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @unique @map("user_id") @db.Uuid
  preferences Json     @default("{}") @db.JsonB
  quietHours  Json?    @map("quiet_hours") @db.JsonB
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  user User @relation("NotificationPreferences", fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}
```

**User model** также обновлён с relations:
```prisma
sentNotifications     Notification[]           @relation("NotificationRecipient")
userNotifications     UserNotification[]       @relation("UserNotifications")
notificationPrefs     NotificationPreference?  @relation("NotificationPreferences")
```

#### Acceptance Criteria
- [x] DDL scripts созданы в `packages/database/migrations/` (0008, 0009, 0010)
- [x] Rollback scripts созданы для всех миграций
- [x] schema.prisma обновлён с тремя моделями + User relations
- [x] Prisma schema валидирован успешно
- [x] Миграции применены в dev окружении (2025-11-25)
- [x] `prisma generate` создал типы для новых моделей
- [x] Seed данные созданы (4 notifications, 5 user_notifications, 15 preferences via trigger)
- [x] Foreign keys валидны (проверено в dev DB)
- [x] Indexes созданы и проверены с EXPLAIN ANALYZE (0.069-0.098ms execution time)

#### Команды для выполнения миграций

```bash
# Week 0: Применить миграции в dev окружении
cd /Users/andreyafanasyev/Projects/Platform/nero_platform/packages/database

# 1. ✅ DDL scripts УЖЕ СОЗДАНЫ:
# - migrations/0008_update_notification_model.sql (+ rollback)
# - migrations/0009_create_user_notifications.sql (+ rollback)
# - migrations/0010_create_notification_preferences.sql (+ rollback)

# 2. ✅ schema.prisma УЖЕ ОБНОВЛЁН (lines 694-763)

# 3. Применить миграции в БД
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0008_update_notification_model.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0009_create_user_notifications.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0010_create_notification_preferences.sql

# 4. Проверить таблицы
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "\d notifications"
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "\dt user_notifications"
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "\dt notification_preferences"

# 5. Валидация Prisma schema
DATABASE_URL="postgres://neiro_user:neiro_password_dev@127.0.0.1:5437/neiro_platform" \
  pnpm exec prisma validate

# 6. Generate Prisma Client с новыми типами
DATABASE_URL="postgres://neiro_user:neiro_password_dev@127.0.0.1:5437/neiro_platform" \
  pnpm exec prisma generate

# 7. Создать seed данные (см. Task 0.6.1 ниже)
DATABASE_URL="postgres://neiro_user:neiro_password_dev@127.0.0.1:5437/neiro_platform" \
  pnpm --filter @neiro/database db:seed:notifications
```

#### Rollback Scripts

**✅ СОЗДАНЫ:** packages/database/migrations/

- `0010_rollback.sql` - Удаляет notification_preferences, triggers, functions
- `0009_rollback.sql` - Удаляет user_notifications, view, triggers
- `0008_rollback.sql` - Откатывает изменения в notifications (удаляет recipient_id, template, last_error)

#### Применение rollback:
```bash
# В обратном порядке!
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0010_rollback.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0009_rollback.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0008_rollback.sql
```

#### ✅ Статус моделей

**Notification:** ⚠️ СУЩЕСТВУЕТ, но **требует обновления** (Migration 0008)
- ❌ НЕТ `recipient_id` → добавляется в 0008
- ❌ НЕТ `template` → добавляется в 0008
- ❌ НЕТ `last_error` → добавляется в 0008
- ✅ Hybrid Approach: explicit fields + JSONB payload

**UserNotification:** ❌ НЕ СУЩЕСТВУЕТ → создаётся в Migration 0009

**NotificationPreference:** ❌ НЕ СУЩЕСТВУЕТ → создаётся в Migration 0010

**Report, MediaAsset:** ✅ УЖЕ СУЩЕСТВУЮТ - миграции не требуются

#### Существующая модель Report (schema.prisma:501-525)

```prisma
model Report {
  id              String    @id @default(uuid()) @db.Uuid
  assignmentId    String    @map("assignment_id") @db.Uuid
  parentId        String    @map("parent_id") @db.Uuid
  reviewedBy      String?   @map("reviewed_by") @db.Uuid
  submittedAt     DateTime  @default(now()) @map("submitted_at") @db.Timestamptz(6)
  status          String    @db.VarChar(20)  // completed, partial, failed
  durationMinutes Int       @map("duration_minutes")
  childMood       String    @map("child_mood") @db.VarChar(20)  // good, neutral, difficult
  feedbackText    String    @map("feedback_text") @db.Text
  media           Json?     @db.JsonB  // ✅ Массив медиа в JSON!
  autoScore       Decimal?  @map("auto_score") @db.Decimal(5, 2)
  reviewedAt      DateTime? @map("reviewed_at") @db.Timestamptz(6)
  reviewStatus    String    @default("not_reviewed") @map("review_status") @db.VarChar(50)

  assignment Assignment    @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  parent     User          @relation("ParentReports", fields: [parentId], references: [id])
  reviews    ReportReview[]

  @@map("reports")
}
```

**Формат Report.media (JSON):**
```json
[
  {
    "url": "https://minio/reports/uuid-123/photo1.jpg",
    "type": "photo",
    "thumbnailUrl": "https://minio/reports/uuid-123/thumb1.jpg",
    "fileSize": 2048576,
    "mimeType": "image/jpeg"
  }
]
```

#### Существующая модель MediaAsset (schema.prisma:678-689)

```prisma
model MediaAsset {
  id        String    @id @default(uuid()) @db.Uuid
  ownerType String    @map("owner_type") @db.VarChar(50)  // "report", "exercise", etc.
  ownerId   String    @map("owner_id") @db.Uuid
  mediaType String?   @map("media_type") @db.VarChar(50)
  path      String    @db.VarChar(500)  // Путь к файлу в MinIO
  checksum  String?   @db.VarChar(64)
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  expiresAt DateTime? @map("expires_at") @db.Timestamptz(6)

  @@map("media_assets")
}
```

**Использование для отчетов:**
```typescript
await prisma.mediaAsset.create({
  data: {
    ownerType: 'report',
    ownerId: reportId,
    mediaType: 'photo',
    path: 'reports/uuid-123/photo1.jpg'
  }
})
```

#### Существующая модель Notification (schema.prisma:696-708) - DELIVERY LAYER

**⚠️ ВАЖНО:** Согласно NOTIFICATIONS_SPLIT_PROPOSAL.md, модель `Notification` используется для **отслеживания доставки** (email/SMS/push), а НЕ для in-app уведомлений UI.

```prisma
model Notification {
  id          String    @id @default(uuid()) @db.Uuid
  recipientId String    @map("recipient_id") @db.Uuid  // Кому отправляем
  channel     String    @db.VarChar(50)  // email, sms, push, telegram
  template    String    @db.VarChar(100)  // assignment_reminder, report_reviewed
  payload     Json      @db.JsonB  // Данные для шаблона
  status      String    @default("pending") @db.VarChar(20)  // pending, sent, failed, bounced
  attempts    Int       @default(0)
  scheduledAt DateTime  @map("scheduled_at") @db.Timestamptz(6)
  sentAt      DateTime? @map("sent_at") @db.Timestamptz(6)
  lastError   String?   @map("last_error") @db.Text  // Текст последней ошибки
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("notifications")
}
```

**Формат Notification.payload (JSON):**
```json
{
  "assignmentId": "uuid-456",
  "assignmentTitle": "Артикуляционная гимнастика",
  "scheduledTime": "15:00",
  "parentName": "Иван"
}
```

**⚠️ Требуется миграция:** Добавить поля `recipientId`, `template`, `lastError` в существующую таблицу `notifications`.

#### Новая модель UserNotification (требуется миграция) - UI LAYER

**Эта модель НЕ СУЩЕСТВУЕТ** - требуется создать миграцию в Week 3 для **in-app уведомлений UI**.

```prisma
model UserNotification {
  id             String    @id @default(uuid()) @db.Uuid
  userId         String    @map("user_id") @db.Uuid
  notificationId String?   @map("notification_id") @db.Uuid  // Связь с delivery notification
  type           String    @db.VarChar(50)  // assignment_reminder, report_reviewed, route_updated
  title          String    @db.VarChar(150)
  body           String    @db.Text
  link           String?   @db.VarChar(255)  // URL для перехода при клике
  status         String    @default("unread") @db.VarChar(20)  // unread, read, archived
  readAt         DateTime? @map("read_at") @db.Timestamptz(6)
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  notification   Notification? @relation(fields: [notificationId], references: [id], onDelete: SetNull)

  @@index([userId, status])
  @@index([userId, createdAt])
  @@map("user_notifications")
}
```

**Пример записи:**
```typescript
await prisma.userNotification.create({
  data: {
    userId: parentId,
    notificationId: emailNotificationId,  // Опционально - связь с email
    type: 'assignment_reminder',
    title: 'Напоминание о задании',
    body: 'Через 1 час начало занятия "Артикуляционная гимнастика"',
    link: '/dashboard/assignments/uuid-456',
    status: 'unread'
  }
})
```

#### Новая модель NotificationPreference (требуется миграция)

**Эта модель НЕ СУЩЕСТВУЕТ** - требуется создать миграцию в Week 3.

```prisma
model NotificationPreference {
  id                 String   @id @default(uuid()) @db.Uuid
  userId             String   @unique @map("user_id") @db.Uuid
  emailEnabled       Boolean  @default(true) @map("email_enabled")
  inAppEnabled       Boolean  @default(true) @map("in_app_enabled")
  assignmentReminders Boolean @default(true) @map("assignment_reminders")
  reportUpdates      Boolean  @default(true) @map("report_updates")
  routeChanges       Boolean  @default(true) @map("route_changes")
  updatedAt          DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}
```

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

---

## Week 0 Exit Criteria (Go/No-Go для Week 1)

### ✅ Обязательные (P0) - блокеры разработки:
- [ ] MinIO buckets созданы и доступны
- [ ] Redis работает и протестирован
- [ ] SendGrid API key получен ИЛИ SMTP настроен
- [ ] `.env` файлы обновлены для всех сервисов
- [ ] Prisma schema preview создан и проверен

### 📋 Желательные (P1) - не блокеры:
- [ ] Документация по инфраструктуре обновлена
- [ ] Тестовые скрипты для проверки MinIO/Redis/SMTP созданы

### 🚨 Red Flags (причины для No-Go):
- ❌ MinIO недоступен или buckets не создаются
- ❌ SendGrid недоступен И SMTP альтернатива не работает
- ❌ Redis недоступен (блокирует Week 2 Analytics)

---

# 📅 WEEK 1: REPORTS SERVICE + FILE UPLOADS

**Цель:** Родители могут отправлять отчеты с фото/видео, специалисты их просматривают

**Трудозатраты:** 40 часов
**Приоритет:** P0 (критический)

---

## 1.1 Backend: Reports Service Setup

### Задача 1.1.1: Инициализация Reports Service
**Приоритет:** P0
**Оценка:** 2 часа
**Зависимости:** нет

#### Acceptance Criteria
- [ ] Создана структура сервиса `services/reports/`
- [ ] Настроен TypeScript + tsconfig.json
- [ ] Dockerfile создан (аналогично другим сервисам)
- [ ] package.json с зависимостями
- [ ] Health check endpoint работает: `GET /health`
- [ ] Сервис добавлен в docker-compose.yml на порт 4009

#### Файлы для создания
```
services/reports/
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts
    ├── app.ts
    └── config/
        └── index.ts
```

#### Технические требования
- Node.js 20 + TypeScript 5
- Express.js framework
- Prisma Client (shared database)
- Winston для логирования
- Helmet для безопасности

---

### Задача 1.1.2: Reports API - CRUD операции
**Приоритет:** P0
**Оценка:** 8 часов
**Зависимости:** 1.1.1

#### API Endpoints

```typescript
POST   /reports/v1                      // Создать отчет
GET    /reports/v1/:id                  // Получить отчет по ID
GET    /reports/v1                      // Список отчетов (с фильтрами)
PATCH  /reports/v1/:id                  // Обновить отчет
DELETE /reports/v1/:id                  // Удалить отчет (soft delete)
```

#### Request/Response примеры

**POST /reports/v1**
```json
{
  "assignmentId": "uuid",
  "durationMinutes": 25,
  "status": "completed",
  "childMood": "good",
  "feedbackText": "Отлично справился с заданием!",
  "media": [
    {
      "mediaId": "uuid",
      "type": "photo",
      "url": "https://storage.neiro.dev/...",
      "durationSeconds": null
    }
  ]
}
```

**Примечания по полям:**
- `durationMinutes` (не `actualDurationMinutes`) - фактическая длительность выполнения
- `status`: `"completed" | "partial" | "failed"` - обязательное поле
- `childMood`: `"good" | "neutral" | "difficult"` (не `happy/sad`)
- `feedbackText` (не `notes`) - комментарий родителя, max 1024 символа
- `media` - массив ссылок на предварительно загруженные медиафайлы через `/media/v1/upload/presigned`
- `parentId` определяется автоматически из JWT token (не передается в запросе)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assignmentId": "uuid",
    "parentId": "uuid",
    "reportDate": "2025-01-21",
    "durationMinutes": 25,
    "status": "completed",
    "childMood": "good",
    "feedbackText": "Отлично справился с заданием!",
    "media": [
      {
        "mediaId": "uuid",
        "type": "photo",
        "url": "https://storage.neiro.dev/...",
        "durationSeconds": null
      }
    ],
    "submittedAt": "2025-01-21T10:31:00Z",
    "reviewStatus": "not_reviewed",
    "reviewedBy": null,
    "reviewedAt": null,
    "reviewNotes": null,
    "autoScore": null
  }
}
```

#### Acceptance Criteria
- [ ] Все 5 endpoint'ов работают
- [ ] Валидация через Zod schemas
- [ ] RBAC: родитель видит только свои отчеты
- [ ] RBAC: специалист видит отчеты своих детей
- [ ] При создании отчета Assignment.status обновляется на "completed"
- [ ] Генерируется событие `reports.report.submitted` в EventOutbox (DATA_MODEL_AND_EVENTS.md §2.6)
- [ ] Unit-тесты для всех методов (>80% coverage)

#### Файлы для создания
```
src/
├── controllers/
│   └── reports.controller.ts
├── services/
│   └── reports.service.ts
├── validation/
│   └── report.schema.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── rbac.middleware.ts
└── routes/
    └── reports.routes.ts
```

---

### Задача 1.1.3: Media Upload Integration (MinIO)
**Приоритет:** P0
**Оценка:** 6 часов
**Зависимости:** 1.1.2

#### API Endpoints (Media & Storage Service)

**Соответствует API_CONTRACTS_MVP.md Section 12:**

```typescript
POST   /media/v1/upload/presigned  // Получить presigned URL для загрузки
POST   /media/v1/:id/confirm       // Подтвердить успешную загрузку
GET    /media/v1/:id               // Получить метаданные + download URL
DELETE /media/v1/:id               // Удалить медиа (soft delete)
```

#### Upload Flow (3 шага)

**Шаг 1:** Клиент запрашивает presigned URL
```json
POST /media/v1/upload/presigned
{
  "fileName": "video_session.mp4",
  "contentType": "video/mp4",
  "fileSize": 15728640,
  "ownerType": "report",
  "ownerId": "uuid",
  "expiresIn": 3600
}

Response:
{
  "mediaId": "uuid",
  "uploadUrl": "https://storage.neiro.dev/uploads/...",
  "headers": {
    "Content-Type": "video/mp4",
    "X-Upload-Token": "..."
  },
  "expiresAt": "2025-01-11T11:00:00Z"
}
```

**Шаг 2:** Клиент загружает файл напрямую на presigned URL (MinIO)
```javascript
await fetch(uploadUrl, {
  method: 'PUT',
  headers: headers,
  body: file
});
```

**Шаг 3:** Клиент подтверждает загрузку
```json
POST /media/v1/:id/confirm
{
  "checksum": "sha256-hash"
}

Response:
{
  "status": "confirmed",
  "url": "https://cdn.neiro.dev/..."
}
```

#### Acceptance Criteria
- [ ] Поддержка форматов: `image/*`, `video/*`, `audio/*` (валидация MIME)
- [ ] Максимальный размер файла: 10MB (фото), 100MB (видео) — согласно API_CONTRACTS_MVP.md:834
- [ ] Presigned URL generation с MinIO SDK
- [ ] Sharp для сжатия изображений (quality: 80)
- [ ] MinIO bucket: `neiro-reports`
- [ ] Генерация thumbnail'ов для фото (300x300)
- [ ] Presigned URLs с expiration = 1 час (по умолчанию)
- [ ] Валидация `ownerType` enum: `report | diagnostic_session | child_profile`
- [ ] Запись в таблицу `media_assets` (polymorphic: owner_type, owner_id)
- [ ] **ВАЖНО:** Событие `media.upload.confirmed` в EventOutbox после подтверждения
- [ ] Генерация `reports.media.attached` при привязке к отчету

#### Технические детали
```typescript
// media.service.ts
interface UploadResult {
  mediaAsset: MediaAsset;
  presignedUrl: string;
  thumbnailUrl?: string; // для фото
}

// MinIO configuration
const MINIO_CONFIG = {
  endpoint: process.env.MINIO_ENDPOINT,
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
};
```

#### Файлы для создания
```
src/
├── services/
│   ├── media.service.ts
│   └── minio.client.ts
├── middleware/
│   └── upload.middleware.ts
└── utils/
    ├── image-processor.ts
    └── file-validator.ts
```

---

### Задача 1.1.4: Report Reviews для специалистов
**Приоритет:** P1
**Оценка:** 4 часа
**Зависимости:** 1.1.2

#### API Endpoints

```typescript
GET    /reports/v1/reviews/pending      // Отчеты на проверку
POST   /reports/v1/:id/review           // Добавить отзыв
PATCH  /reports/v1/:id/review-status    // Изменить статус проверки
```

#### Request/Response

**POST /reports/v1/:id/review** (соответствует API_CONTRACTS_MVP.md:771-775)
```json
{
  "reviewStatus": "approved",
  "notes": "Отличная работа! Продолжаем в том же духе. Рекомендую увеличить сложность упражнения."
}
```

**Примечания:**
- `reviewStatus`: `"approved" | "needs_attention" | "rejected"` - статус проверки
- `notes`: `string<=512` - комментарий специалиста (не `specialistNotes`)
- Поле `nextSteps` удалено - используйте `notes` для рекомендаций
- `reviewedBy` и `reviewedAt` определяются автоматически из JWT token

#### Acceptance Criteria
- [ ] Специалист может одобрить (approved), запросить внимание (needs_attention) или отклонить (rejected)
- [ ] При создании review генерируется событие `reports.report.reviewed` в EventOutbox
- [ ] Обновление полей в таблице `reports`: `reviewed_by`, `reviewed_at`, `review_status`, `review_notes`
- [ ] Фильтры: по ребенку, дате, статусу проверки
- [ ] Сортировка: сначала непроверенные (review_status = 'not_reviewed'), потом по submitted_at DESC

#### Файлы для изменения/создания
```
src/
├── controllers/
│   └── reviews.controller.ts
├── services/
│   └── reviews.service.ts
└── routes/
    └── reviews.routes.ts
```

---

## 1.2 Frontend: Report Submission

### Задача 1.2.1: CreateReportDialog Component
**Приоритет:** P0
**Оценка:** 6 часов
**Зависимости:** 1.1.2

#### UI Спецификация

**⚠️ ВАЖНО:** childMood должен соответствовать API_CONTRACTS_MVP.md: `"good" | "neutral" | "difficult"` (3 значения, НЕ 5).

**Форма содержит:**
1. Duration slider (0-120 минут)
2. **Mood selector** (3 значения):
   - 😊 "Хорошо" → `childMood: "good"`
   - 😐 "Нейтрально" → `childMood: "neutral"`
   - 😟 "Трудно" → `childMood: "difficult"`
3. Notes текстовое поле (обязательное, min 20 символов) → отправляется как `feedbackText`
4. Media upload (drag-and-drop + file picker)
5. Кнопки: Отмена, Отправить

**⚠️ УДАЛЕНО из формы:**
- ~~Engagement selector~~ - нет такого поля в Report model
- ~~Difficulties текстовое поле~~ - нет такого поля в Report model

#### Acceptance Criteria
- [ ] Диалог открывается после кнопки "Завершить" на Assignment
- [ ] Валидация: notes обязательно, min 20 символов
- [ ] Mood selector - интерактивные эмодзи (hover effect)
- [ ] Duration slider с визуальными метками
- [ ] Media upload с preview перед отправкой
- [ ] Progress bar во время upload
- [ ] Success toast после отправки
- [ ] Error handling с понятными сообщениями
- [ ] Responsive дизайн (mobile-friendly)

#### Файлы для создания
```
apps/web/src/
├── components/
│   └── reports/
│       ├── CreateReportDialog.tsx
│       ├── MoodSelector.tsx
│       ├── DurationSlider.tsx
│       └── MediaUploader.tsx
└── lib/
    └── api/
        └── reports.ts
```

#### UI Mockup (текстовый)
```
┌─────────────────────────────────────────────────────┐
│  Отчет о выполнении                            [X]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Длительность: [========|-----] 25 минут           │
│                                                     │
│  Настроение ребенка:                               │
│  😟 Трудно   😐 Нейтрально   ● 😊 Хорошо           │
│  (difficult)  (neutral)        (good)              │
│                                                     │
│  Комментарий: *                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │ Алиса отлично справилась с заданием!       │  │
│  │ Показала значительный прогресс.             │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Фото/Видео:                                       │
│  ┌───────────┐  ┌───────────┐                     │
│  │  [photo]  │  │  [+Add]   │                     │
│  │   📷      │  │           │                     │
│  └───────────┘  └───────────┘                     │
│                                                     │
│             [Отмена]  [Отправить отчет]            │
└─────────────────────────────────────────────────────┘
```

**Mapping UI → API:**
```typescript
// UI показывает эмодзи, но отправляет строковые значения
const moodMapping = {
  '😟 Трудно': 'difficult',
  '😐 Нейтрально': 'neutral',
  '😊 Хорошо': 'good'
};

// API Request
POST /reports/v1
{
  "assignmentId": "uuid",
  "durationMinutes": 25,
  "status": "completed",
  "childMood": "good",  // ✅ НЕ "happy" или emoji
  "feedbackText": "Алиса отлично справилась с заданием!",  // ✅ НЕ "notes"
  "media": [...]
}
```

---

### Задача 1.2.2: Media Upload Component
**Приоритет:** P0
**Оценка:** 4 часа
**Зависимости:** 1.1.3, 1.2.1

#### Функционал
- Drag & Drop зона
- File picker (кнопка "Выбрать файл")
- Preview загруженных файлов
- Delete кнопка для каждого файла
- Progress bar для каждого upload
- Поддержка множественного выбора

#### Acceptance Criteria
- [ ] Drag & Drop работает (с визуальным feedback)
- [ ] Валидация форматов на клиенте (JPEG, PNG, MP4, MOV)
- [ ] Валидация размера на клиенте (max 10MB для фото, 100MB для видео)
- [ ] Preview для фото (thumbnail)
- [ ] Play button для видео preview
- [ ] Upload progress для каждого файла отдельно
- [ ] Retry mechanism при ошибке upload
- [ ] Можно удалить файл до отправки формы
- [ ] Limit: максимум 5 файлов на отчет

#### Технические детали
```typescript
interface MediaUploaderProps {
  maxFiles?: number;
  maxSizePhoto?: number; // bytes (default: 10MB = 10_485_760 bytes)
  maxSizeVideo?: number; // bytes (default: 100MB = 104_857_600 bytes)
  acceptedFormats?: string[];
  onUploadComplete?: (media: MediaAsset[]) => void;
  onError?: (error: Error) => void;
}

// Defaults согласно API_CONTRACTS_MVP.md v0.9
const DEFAULT_MAX_SIZE_PHOTO = 10_485_760; // 10MB
const DEFAULT_MAX_SIZE_VIDEO = 104_857_600; // 100MB
```

---

### Задача 1.2.3: Интеграция Reports в Assignments Page
**Приоритет:** P0
**Оценка:** 3 часа
**Зависимости:** 1.2.1, 1.2.2

#### Изменения
- Добавить кнопку "Создать отчет" для completed assignments
- Показывать badge "Отчет отправлен" если report существует
- Кнопка "Просмотреть отчет" открывает ReadReportDialog

#### Acceptance Criteria
- [ ] Кнопка "Создать отчет" видна только для completed assignments
- [ ] Кнопка disabled если отчет уже существует
- [ ] После создания отчета UI обновляется (без refresh)
- [ ] Badge показывает статус review: "На проверке" / "Одобрено" / "Требует внимания"

#### Файлы для изменения
```
apps/web/src/app/dashboard/assignments/page.tsx
```

---

## 1.3 Frontend: Report Review Dashboard

### Задача 1.3.1: Reports List Page (для специалистов)
**Приоритет:** P1
**Оценка:** 6 часов
**Зависимости:** 1.1.4

#### UI Спецификация
**Страница:** `/dashboard/reports`

**Фильтры:**
- Ребенок (dropdown, multiple select)
- Статус проверки (все / не проверено / одобрено / требует внимания)
- Дата (date range picker)

**Список отчетов (карточки):**
- Фото ребенка + имя
- Название упражнения
- Дата выполнения
- Duration
- Mood (эмодзи)
- Badge статуса проверки
- Preview медиа (первое фото/видео)
- Кнопка "Просмотреть и оценить"

#### Acceptance Criteria
- [ ] Отчеты сортируются: сначала непроверенные, потом по дате (новые первыми)
- [ ] Фильтры работают (query params в URL)
- [ ] Infinite scroll или pagination (по 20 отчетов)
- [ ] Loading states
- [ ] Empty state: "Нет отчетов для проверки"
- [ ] Mobile-responsive

#### Файлы для создания
```
apps/web/src/
├── app/
│   └── dashboard/
│       └── reports/
│           ├── page.tsx
│           └── layout.tsx
└── components/
    └── reports/
        ├── ReportCard.tsx
        ├── ReportFilters.tsx
        └── ReportsList.tsx
```

---

### Задача 1.3.2: ReviewReportDialog Component
**Приоритет:** P1
**Оценка:** 5 часов
**Зависимости:** 1.3.1

#### UI Спецификация
**Диалог содержит:**
1. Информация об отчете (read-only)
   - Ребенок, упражнение, дата
   - Duration, mood, engagement
   - Комментарий родителя
2. Галерея медиа (фото + видео плеер)
3. Форма отзыва специалиста
   - Radio buttons: Одобрить / Требует внимания
   - Текстовое поле: Комментарий специалиста
   - Текстовое поле: Следующие шаги (опционально)
4. Кнопки: Закрыть, Сохранить отзыв

#### Acceptance Criteria
- [ ] Все данные отчета отображаются
- [ ] Медиа в галерее (Lightbox для фото, Video player для видео)
- [ ] Форма отзыва с валидацией (комментарий обязателен, min 10 символов)
- [ ] После сохранения генерируется событие для уведомления родителя
- [ ] Success toast: "Отзыв сохранен"
- [ ] Список отчетов обновляется после сохранения

#### Файлы для создания
```
apps/web/src/components/reports/
├── ReviewReportDialog.tsx
├── MediaGallery.tsx
└── VideoPlayer.tsx
```

---

## 1.4 Testing & Documentation

### Задача 1.4.1: E2E Tests для Reports
**Приоритет:** P1
**Оценка:** 4 часа
**Зависимости:** 1.2.3, 1.3.2

#### Тесты
```typescript
// apps/web/e2e/reports.spec.ts

test.describe('Reports Management', () => {
  test('R-1: Родитель может создать отчет', async ({ page }) => {
    // 1. Login как parent
    // 2. Navigate to assignments
    // 3. Click "Завершить" на assignment
    // 4. Fill report form
    // 5. Upload photo
    // 6. Submit
    // 7. Verify success message
    // 8. Verify assignment status = completed
  });

  test('R-2: Родитель может загрузить фото', async ({ page }) => {
    // Проверка drag & drop и file picker
  });

  test('R-3: Специалист может просмотреть отчет', async ({ page }) => {
    // 1. Login как specialist
    // 2. Navigate to /dashboard/reports
    // 3. Verify отчеты видны
    // 4. Click "Просмотреть"
    // 5. Verify медиа отображается
  });

  test('R-4: Специалист может оставить отзыв', async ({ page }) => {
    // 1. Open report
    // 2. Fill review form
    // 3. Submit
    // 4. Verify status изменился
  });
});
```

#### Acceptance Criteria
- [ ] Все 4+ теста проходят
- [ ] Тесты покрывают happy path + error cases
- [ ] Screenshots для failing tests
- [ ] Seed данные для тестов (assignments + reports)

---

### Задача 1.4.2: API Documentation (Swagger)
**Приоритет:** P2
**Оценка:** 2 часа
**Зависимости:** 1.1.4

#### Acceptance Criteria
- [ ] Swagger UI доступен: http://localhost:4009/api-docs
- [ ] Все endpoints задокументированы
- [ ] Request/Response примеры
- [ ] Authentication описан (JWT Bearer)
- [ ] Error responses задокументированы

#### Файлы для создания
```
services/reports/src/
├── swagger/
│   └── openapi.yaml
└── routes/
    └── docs.routes.ts
```

---

## Week 1 Deliverables Checklist

### Backend
- [ ] Reports Service развернут и работает на порту 4009
- [ ] CRUD API для отчетов (5 endpoints)
- [ ] Media upload с MinIO интеграцией
- [ ] Report reviews API для специалистов
- [ ] Events публикуются в EventOutbox
- [ ] Health check работает
- [ ] Unit-тесты (>80% coverage)
- [ ] API документация (Swagger)

### Frontend
- [ ] CreateReportDialog с полным функционалом
- [ ] Media upload component (drag & drop + preview)
- [ ] Integration в Assignments page
- [ ] Reports list page для специалистов
- [ ] ReviewReportDialog для отзывов
- [ ] E2E тесты проходят (4+ тестов)

### Infrastructure
- [ ] Reports service добавлен в docker-compose.yml с healthcheck
- [ ] MinIO bucket `neiro-reports` создан
- [ ] Database migrations (если нужны индексы)

**Пример docker-compose.yml с healthcheck:**
```yaml
services:
  reports:
    build: ./services/reports
    ports:
      - "4009:4009"
    environment:
      DATABASE_URL: postgres://neiro_user:neiro_password_dev@postgres:5432/neiro_platform
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin123
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4009/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_started
```

**Health check endpoint в Reports Service:**
```typescript
// services/reports/src/routes/health.ts
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;  // Check DB
    await minioClient.bucketExists('neiro-reports');  // Check MinIO
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

---

## Week 1 Exit Criteria (Go/No-Go для Week 2)

### ✅ Must-Have (P0) - блокеры Week 2:
- [ ] **Functional:** Родитель может создать отчет с 1+ фото через UI
- [ ] **Functional:** Специалист видит отчет и может оставить review (approve/reject)
- [ ] **Technical:** Reports Service healthy и отвечает < 200ms (p95)
- [ ] **Technical:** MinIO хранит файлы, thumbnails генерируются
- [ ] **Tests:** Минимум 4 E2E теста проходят (report creation, media upload, review, list)
- [ ] **Integration:** EventOutbox публикует события `report.submitted`, `report.reviewed`

### 📊 Success Metrics (измеримые критерии):
- [ ] **API Performance:** `GET /reports` < 100ms (p95), `POST /reports` < 300ms (p95)
- [ ] **File Upload:** Фото до 10MB загружаются < 5 секунд
- [ ] **Test Coverage:** Backend >80%, Frontend >70%
- [ ] **Error Rate:** < 1% failed requests в ручном тестировании

### 📋 Nice-to-Have (P1) - не блокеры:
- [ ] Video upload работает (можно отложить на Week 2)
- [ ] Report list pagination (для >100 отчетов)
- [ ] Media preview lightbox (можно упростить)

### 🚨 Red Flags (причины для No-Go в Week 2):
- ❌ MinIO storage не работает или файлы теряются
- ❌ Reports API возвращает >5% errors
- ❌ E2E тесты падают >50% прогонов (flaky tests)
- ❌ Критичный баг: отчеты создаются но не сохраняются в БД

### 🔄 Burn-Down Tracking:
**Запланировано:** 40 часов
**P0 задачи:** 32 часа (80%)
**P1 задачи:** 8 часов (20%)

**Burn-down правило:** Если к середине недели (20ч) выполнено <40% P0 задач, сбросить приоритет всех P1 задач и сфокусироваться на P0.

---

# 📅 WEEK 2: ANALYTICS & PROGRESS TRACKING

**Цель:** Родители и специалисты видят прогресс с графиками и метриками

**Трудозатраты:** 36 часов
**Приоритет:** P0 (критический)

---

## 2.1 Backend: Analytics Service

### Задача 2.1.1: Analytics Service Setup
**Приоритет:** P0
**Оценка:** 2 часа
**Зависимости:** нет

#### Acceptance Criteria
- [ ] Структура сервиса создана
- [ ] Dockerfile + docker-compose integration (порт 4010)
- [ ] Health check endpoint
- [ ] Prisma Client настроен

#### Файлы для создания
```
services/analytics/
├── Dockerfile
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    └── app.ts
```

---

### Задача 2.1.2: Child Progress API
**Приоритет:** P0
**Оценка:** 8 часов
**Зависимости:** 2.1.1

#### API Endpoints

✅ **ПРИМЕЧАНИЕ:** Эти endpoints добавлены в API_CONTRACTS_MVP.md v0.9 (обновлено 22 ноября 2025).

**Спецификация:** См. API_CONTRACTS_MVP.md Section 11.1 (Analytics Detailed Endpoints):
- `GET /analytics/v1/children/:childId/progress`
- `GET /analytics/v1/children/:childId/assignments-stats`
- `GET /analytics/v1/children/:childId/goals-progress`
- `GET /analytics/v1/children/:childId/timeline`
- `GET /analytics/v1/routes/:routeId/progress`
- `GET /analytics/v1/specialists/:specialistId/performance`

См. полные request/response контракты в API_CONTRACTS_MVP.md v0.9 для точных примеров.

```typescript
GET /analytics/v1/children/:childId/progress
GET /analytics/v1/children/:childId/assignments-stats
GET /analytics/v1/children/:childId/goals-progress
GET /analytics/v1/children/:childId/timeline
```

#### Response Examples

**GET /analytics/v1/children/:childId/progress**
```json
{
  "success": true,
  "data": {
    "childId": "uuid",
    "overallProgress": 67.5,
    "assignments": {
      "total": 40,
      "completed": 27,
      "completionRate": 67.5,
      "averageDuration": 22.5,
      "onTime": 25,
      "late": 2
    },
    "goals": {
      "total": 12,
      "achieved": 5,
      "achievementRate": 41.7
    },
    "mood": {
      "good": 18,
      "neutral": 7,
      "difficult": 2
    },
    "currentPhase": {
      "id": "uuid",
      "name": "Фаза 2",
      "progress": 75.0
    }
  }
}
```

**GET /analytics/v1/children/:childId/assignments-stats**
```json
{
  "success": true,
  "data": {
    "timeSeries": [
      { "date": "2025-01-01", "completed": 3, "scheduled": 5 },
      { "date": "2025-01-02", "completed": 4, "scheduled": 4 }
    ],
    "byExerciseType": {
      "speech": { "total": 12, "completed": 10 },
      "motor": { "total": 10, "completed": 8 },
      "cognitive": { "total": 8, "completed": 6 }
    },
    "byDeliveryChannel": {
      "in_person": 15,
      "home": 10,
      "telepractice": 2
    }
  }
}
```

#### Acceptance Criteria
- [ ] Все 4 endpoint'а работают
- [ ] Агрегация данных из Assignment, Report, RouteGoal
- [ ] Кэширование в Redis (TTL = 5 минут)
- [ ] Query параметры: startDate, endDate для фильтрации
- [ ] RBAC: родитель видит только своих детей
- [ ] RBAC: специалист видит только назначенных детей
- [ ] Performance: запросы < 500ms

#### Файлы для создания
```
src/
├── controllers/
│   └── progress.controller.ts
├── services/
│   ├── aggregation.service.ts
│   ├── metrics.service.ts
│   └── cache.service.ts
└── utils/
    └── date-helpers.ts
```

---

### Задача 2.1.3: Route Progress API
**Приоритет:** P1
**Оценка:** 4 часа
**Зависимости:** 2.1.2

#### API Endpoints

```typescript
GET /analytics/v1/routes/:routeId/progress
GET /analytics/v1/routes/:routeId/phases
GET /analytics/v1/routes/:routeId/milestones
```

#### Response Example

**GET /analytics/v1/routes/:routeId/progress**
```json
{
  "success": true,
  "data": {
    "routeId": "uuid",
    "title": "Индивидуальный маршрут - Алиса",
    "status": "active",
    "startDate": "2024-09-01",
    "overallProgress": 45.5,
    "phases": [
      {
        "id": "uuid",
        "name": "Фаза 1: Адаптация",
        "progress": 100,
        "status": "completed"
      },
      {
        "id": "uuid",
        "name": "Фаза 2: Развитие речи",
        "progress": 75,
        "status": "active"
      }
    ],
    "goals": [
      {
        "id": "uuid",
        "description": "Улучшить артикуляцию звука Р",
        "achieved": true,
        "achievedAt": "2024-12-15"
      }
    ]
  }
}
```

#### Acceptance Criteria
- [ ] Расчет прогресса по фазам
- [ ] Расчет достижения целей
- [ ] Timeline ключевых событий (milestones)
- [ ] Кэширование результатов

---

### Задача 2.1.4: Specialist Overview API
**Приоритет:** P1
**Оценка:** 4 часов
**Зависимости:** 2.1.2

#### API Endpoint

```typescript
GET /analytics/v1/specialists/:specialistId/overview
```

#### Response
```json
{
  "success": true,
  "data": {
    "specialistId": "uuid",
    "children": {
      "total": 8,
      "active": 7,
      "paused": 1
    },
    "assignments": {
      "total": 156,
      "completed": 120,
      "pending": 36,
      "completionRate": 76.9
    },
    "reports": {
      "pending": 5,
      "reviewedToday": 8
    },
    "topPerformers": [
      { "childId": "uuid", "name": "Алиса", "completionRate": 92.5 },
      { "childId": "uuid", "name": "Борис", "completionRate": 85.0 }
    ],
    "needsAttention": [
      { "childId": "uuid", "name": "Виктор", "completionRate": 55.0 }
    ]
  }
}
```

#### Acceptance Criteria
- [ ] Агрегация по всем детям специалиста
- [ ] Идентификация top performers и needs attention
- [ ] Dashboard-ready data format

---

## 2.2 Frontend: Parent Progress Dashboard

### Задача 2.2.1: Progress Page Layout
**Приоритет:** P0
**Оценка:** 4 часа
**Зависимости:** 2.1.2

#### UI Структура
**Страница:** `/dashboard/progress`

**Секции:**
1. Header с выбором ребенка (если детей несколько)
2. KPI Cards (4 карточки в ряд)
   - Выполнено заданий
   - Процент завершения
   - Достигнуто целей
   - Текущая фаза маршрута
3. Charts Section (2 колонки)
   - Assignment Completion Timeline (line chart)
   - Mood Distribution (pie chart)
4. Goals Progress (progress bars)
5. Recent Activity (список последних отчетов)

#### Acceptance Criteria
- [ ] Responsive grid layout (mobile: 1 col, tablet: 2 col, desktop: 4 col)
- [ ] Loading skeletons для всех секций
- [ ] Error states с retry buttons
- [ ] Date range picker для фильтрации (last 7 days, 30 days, 90 days, all time)
- [ ] Data auto-refresh каждые 5 минут

#### Файлы для создания
```
apps/web/src/
├── app/
│   └── dashboard/
│       └── progress/
│           ├── page.tsx
│           └── loading.tsx
└── components/
    └── analytics/
        ├── KPICard.tsx
        ├── DateRangeFilter.tsx
        └── ProgressHeader.tsx
```

---

### Задача 2.2.2: Charts Implementation
**Приоритет:** P0
**Оценка:** 6 часов
**Зависимости:** 2.2.1

#### Charts Library
Использовать **Recharts** (уже в dependencies?)

#### Charts Types
1. **Line Chart** - Assignment completion over time
2. **Pie Chart** - Mood distribution
3. **Bar Chart** - Exercise types distribution
4. **Progress Bars** - Goals achievement

#### Acceptance Criteria
- [ ] Responsive charts (адаптируются под размер контейнера)
- [ ] Tooltips с детальной информацией
- [ ] Legend для всех charts
- [ ] Цветовая схема соответствует design system
- [ ] Анимация при загрузке
- [ ] Empty state: "Недостаточно данных для визуализации"

#### Технические детали
```typescript
// Chart data format
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}
```

#### Файлы для создания
```
apps/web/src/components/analytics/
├── LineChart.tsx
├── PieChart.tsx
├── BarChart.tsx
└── ProgressBar.tsx
```

---

### Задача 2.2.3: Goals Progress Section
**Приоритет:** P1
**Оценка:** 3 часа
**Зависимости:** 2.1.2

#### UI Спецификация
**Каждая цель отображается как:**
- Название цели
- Progress bar (0-100%)
- Badge статуса (active / achieved / paused)
- Target date
- Description (expandable)

#### Acceptance Criteria
- [ ] Цели сортируются: активные первыми, затем достигнутые
- [ ] Progress bar цвет зависит от прогресса (red < 50%, yellow 50-80%, green > 80%)
- [ ] Achieved goals помечены зеленой галочкой
- [ ] Expandable description (click to expand)

#### Файлы для создания
```
apps/web/src/components/analytics/
├── GoalProgress.tsx
└── GoalCard.tsx
```

---

## 2.3 Frontend: Specialist Analytics Dashboard

### Задача 2.3.1: Specialist Overview Page
**Приоритет:** P1
**Оценка:** 5 часов
**Зависимости:** 2.1.4

#### UI Структура
**Страница:** `/dashboard/specialist/analytics`

**Секции:**
1. Overview KPIs (карточки)
   - Total Children
   - Total Assignments
   - Completion Rate
   - Pending Reports
2. Top Performers (список детей с высоким completion rate)
3. Needs Attention (список детей с низким completion rate)
4. Recent Reports to Review
5. Charts:
   - Completion rates comparison (bar chart)
   - Activity heatmap (calendar view)

#### Acceptance Criteria
- [ ] Данные загружаются с `/analytics/v1/specialists/:id/overview`
- [ ] Click на ребенка → переход на его детальную страницу прогресса
- [ ] Фильтры: active children only / all children
- [ ] Export to CSV (опционально)

#### Файлы для создания
```
apps/web/src/
├── app/
│   └── dashboard/
│       └── specialist/
│           └── analytics/
│               └── page.tsx
└── components/
    └── analytics/
        ├── SpecialistOverview.tsx
        ├── ChildrenComparison.tsx
        └── ActivityHeatmap.tsx
```

---

## 2.4 Testing & Documentation

### Задача 2.4.1: E2E Tests для Progress Dashboard
**Приоритет:** P1
**Оценка:** 3 часа
**Зависимости:** 2.2.3, 2.3.1

#### Тесты
```typescript
// apps/web/e2e/progress.spec.ts

test.describe('Progress Dashboard', () => {
  test('PR-1: Родитель видит прогресс ребенка', async ({ page }) => {
    // 1. Login как parent
    // 2. Navigate to /dashboard/progress
    // 3. Verify KPI cards visible
    // 4. Verify charts loaded
    // 5. Verify goals section visible
  });

  test('PR-2: Графики отображаются корректно', async ({ page }) => {
    // Проверка что charts rendered
  });

  test('PR-3: Специалист видит обзор детей', async ({ page }) => {
    // 1. Login как specialist
    // 2. Navigate to /dashboard/specialist/analytics
    // 3. Verify overview data
    // 4. Verify top performers list
  });
});
```

#### Acceptance Criteria
- [ ] Все 3+ теста проходят
- [ ] Проверка что charts rendered (screenshot comparison)
- [ ] Seed данные для тестов

---

## Week 2 Deliverables Checklist

### Backend
- [ ] Analytics Service развернут на порту 4010
- [ ] Child progress API (4 endpoints)
- [ ] Route progress API (3 endpoints)
- [ ] Specialist overview API
- [ ] Redis caching для агрегаций
- [ ] Health check работает
- [ ] Unit-тесты (>70% coverage)

### Frontend
- [ ] Progress dashboard для родителей (/dashboard/progress)
- [ ] Charts implementation (line, pie, bar)
- [ ] Goals progress section
- [ ] Specialist analytics page
- [ ] E2E тесты проходят (3+ тестов)
- [ ] Responsive design

### Infrastructure
- [ ] Analytics service в docker-compose.yml с healthcheck
- [ ] Redis cache configured

**Пример docker-compose.yml с healthcheck:**
```yaml
services:
  analytics:
    build: ./services/analytics
    ports:
      - "4010:4010"
    environment:
      DATABASE_URL: postgres://neiro_user:neiro_password_dev@postgres:5432/neiro_platform
      REDIS_URL: redis://redis:6379
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4010/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
```

**Health check endpoint в Analytics Service:**
```typescript
// services/analytics/src/routes/health.ts
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;  // Check DB
    await redisClient.ping();  // Check Redis
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

---

## Week 2 Exit Criteria (Go/No-Go для Week 3)

### ✅ Must-Have (P0) - блокеры Week 3:
- [ ] **Functional:** Родитель видит прогресс ребенка с 2+ графиками (completion rate, activity over time)
- [ ] **Functional:** Специалист видит overview dashboards с key metrics (assignments, completion, avg rating)
- [ ] **Technical:** Analytics Service healthy и отвечает < 300ms (p95) с кэшированием
- [ ] **Technical:** Redis кэш работает, cache hit rate >70%
- [ ] **Tests:** Минимум 3 E2E теста проходят (progress view, charts render, specialist dashboard)
- [ ] **Data:** Прогресс рассчитывается корректно для >10 assignments

### 📊 Success Metrics (измеримые критерии):
- [ ] **API Performance:** `GET /analytics/child/{id}/progress` < 200ms (p95, cached), < 500ms (uncached)
- [ ] **Cache Performance:** Redis TTL 5 минут работает, cache invalidation срабатывает при новых отчетах
- [ ] **Test Coverage:** Backend >70%, Frontend >65%
- [ ] **Data Accuracy:** Completion rate ± 1% от фактического (проверка на seed data)

### 📋 Nice-to-Have (P1) - не блокеры:
- [ ] Advanced charts (heatmap, radar)
- [ ] Export to PDF/Excel
- [ ] Multi-child comparison для родителей с 2+ детьми

### 🚨 Red Flags (причины для No-Go в Week 3):
- ❌ Redis cache не работает или cache invalidation ломает данные
- ❌ Analytics API возвращает неправильные данные (>10% расхождение)
- ❌ Charts не отображаются или падает frontend при рендере
- ❌ P95 latency > 1 секунда даже с кэшированием

### 🔄 Burn-Down Tracking:
**Запланировано:** 36 часов
**P0 задачи:** 30 часов (83%)
**P1 задачи:** 6 часов (17%)

**Burn-down правило:** Если к середине недели (18ч) выполнено <45% P0 задач, пропустить всю визуализацию (charts) и отдать mock data для Week 3.

---

# 📅 WEEK 3: NOTIFICATIONS SYSTEM

**Цель:** Пользователи получают своевременные уведомления о важных событиях

**Трудозатраты:** 28 часов
**Приоритет:** P1 (высокий)

---

## 3.1 Backend: Notifications Service

### Задача 3.1.1: Notifications Service Setup
**Приоритет:** P1
**Оценка:** 2 часа
**Зависимости:** нет

#### Acceptance Criteria
- [ ] Структура сервиса создана
- [ ] Dockerfile + docker-compose (порт 4011)
- [ ] Health check endpoint
- [ ] NodeMailer configured (SMTP)

#### NPM Dependencies
```json
{
  "nodemailer": "^6.9.7",
  "handlebars": "^4.7.8",
  "node-cron": "^3.0.3",
  "web-push": "^3.6.6"
}
```

---

### Задача 3.1.2: Notifications API Architecture
**Приоритет:** P1
**Оценка:** 6 часов
**Зависимости:** 3.1.1

#### ⚠️ ВАЖНО: Архитектура с разделением слоев

Согласно **NOTIFICATIONS_SPLIT_PROPOSAL.md**, система уведомлений разделена на **два независимых слоя**:

1. **Delivery Tracking Layer** (`notifications` table) - отслеживание доставки через email/SMS/push
2. **UI Layer** (`user_notifications` table) - in-app уведомления для интерфейса

**Зачем разделять?**
- Delivery tracking: channel, template, retry logic, delivery status (sent/failed)
- UI notifications: title, body, read/unread status, links
- Разные жизненные циклы: email отправлен раз, но может быть перечитан в UI много раз

#### API Endpoints: Delivery Tracking (Internal)

**Используется только внутри сервисов** для постановки уведомлений в очередь доставки.

```typescript
POST /notifications/v1  // Поставить в очередь доставки (internal only)
```

**Request Example:**
```json
{
  "recipientId": "uuid",
  "channel": "email",  // email | sms | push | telegram
  "template": "assignment_reminder",
  "payload": {
    "assignmentId": "uuid",
    "assignmentTitle": "Артикуляционная гимнастика",
    "scheduledTime": "15:00",
    "parentName": "Иван"
  },
  "scheduledAt": "2025-01-22T14:00:00Z"  // Optional - для отложенной отправки
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "recipientId": "uuid",
    "channel": "email",
    "template": "assignment_reminder",
    "status": "pending",  // pending | sent | failed | bounced
    "scheduledAt": "2025-01-22T14:00:00Z",
    "createdAt": "2025-01-21T10:00:00Z"
  }
}
```

#### API Endpoints: User Notifications (Public)

**Используется клиентским приложением** для отображения in-app уведомлений.

```typescript
GET    /user-notifications/v1           // Список уведомлений для UI
GET    /user-notifications/v1/:id       // Детали уведомления
PATCH  /user-notifications/v1/:id/read  // Отметить прочитанным
PATCH  /user-notifications/v1/read-all  // Отметить все прочитанными
DELETE /user-notifications/v1/:id       // Удалить (soft delete)

GET    /notification-preferences/v1     // Получить настройки
PATCH  /notification-preferences/v1     // Обновить настройки
```

**Response Example: GET /user-notifications/v1**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "userId": "uuid",
        "type": "assignment_reminder",
        "title": "Напоминание о задании",
        "body": "Сегодня в 15:00 - Пальчиковая гимнастика для Алисы",
        "link": "/dashboard/assignments/uuid",
        "status": "unread",  // unread | read | archived
        "readAt": null,
        "createdAt": "2025-01-21T10:00:00Z"
      },
      {
        "id": "uuid2",
        "userId": "uuid",
        "type": "report_reviewed",
        "title": "Отчёт проверен",
        "body": "Специалист проверил отчёт за 20.01.2025. Статус: Одобрено",
        "link": "/dashboard/reports/uuid2",
        "status": "read",
        "readAt": "2025-01-21T11:30:00Z",
        "createdAt": "2025-01-21T11:00:00Z"
      }
    ],
    "total": 15,
    "unread": 3
  }
}
```

**Response Example: GET /notification-preferences/v1**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "emailEnabled": true,
    "inAppEnabled": true,
    "assignmentReminders": true,
    "reportUpdates": true,
    "routeChanges": false,
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

**Request Example: PATCH /notification-preferences/v1**
```json
{
  "assignmentReminders": false,
  "reportUpdates": true
}
```

#### Acceptance Criteria
- [ ] **Delivery API**: POST endpoint для постановки в очередь (internal only)
- [ ] **UI API**: CRUD операции для user_notifications
- [ ] **Preferences API**: GET/PATCH для настроек уведомлений
- [ ] Фильтры: read/unread, по типу, по дате
- [ ] Pagination (по 20 items)
- [ ] RBAC: пользователь видит только свои уведомления
- [ ] Soft delete для user_notifications
- [ ] Миграция: создание таблиц `user_notifications` и `notification_preferences`
- [ ] Миграция: добавление полей `recipientId`, `template`, `lastError` в `notifications`

#### Файлы для создания
```
services/notifications/src/
├── controllers/
│   ├── delivery.controller.ts        # Internal delivery API
│   ├── user-notifications.controller.ts  # Public UI API
│   └── preferences.controller.ts     # Preferences API
├── services/
│   ├── delivery.service.ts           # Queue notifications for delivery
│   ├── user-notifications.service.ts # Manage UI notifications
│   └── preferences.service.ts        # Manage user preferences
└── migrations/
    ├── add-user-notifications-table.sql
    └── add-notification-preferences-table.sql
```

---

### Задача 3.1.3: Email Delivery Service
**Приоритет:** P1
**Оценка:** 6 часов
**Зависимости:** 3.1.2

#### Email Provider
**Опции:**
1. **SendGrid** (recommended) - free tier 100 emails/day
2. **AWS SES** - $0.10 per 1000 emails
3. **Gmail SMTP** - для dev/test (не для production)

#### Email Templates (Handlebars)

**Assignment Reminder:**
```html
<!-- templates/assignment-reminder.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Напоминание о задании</title>
</head>
<body>
  <h2>Привет, {{parentName}}!</h2>
  <p>Напоминаем о задании для {{childName}}:</p>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
    <h3>{{assignmentTitle}}</h3>
    <p><strong>Срок выполнения:</strong> {{dueDate}}</p>
    <p><strong>Длительность:</strong> {{duration}} минут</p>
  </div>

  <a href="{{assignmentUrl}}" style="...">Открыть задание</a>
</body>
</html>
```

#### Acceptance Criteria
- [ ] NodeMailer настроен (SMTP credentials в .env)
- [ ] Handlebars templates для 5+ типов уведомлений
- [ ] Email queue (не блокируем основной поток)
- [ ] Retry mechanism (3 попытки с exponential backoff)
- [ ] Email delivery tracking (sent, failed)
- [ ] Unsubscribe link в каждом email
- [ ] HTML + Plain text versions

#### Типы Email Templates
1. `assignment-reminder.html` - За 24ч до срока
2. `assignment-overdue.html` - Просрочено
3. `report-submitted.html` - Родитель отправил отчет (→ специалисту)
4. `report-reviewed.html` - Специалист проверил отчет (→ родителю)
5. `welcome-email.html` - Приглашение в систему

#### Файлы для создания
```
services/notifications/src/
├── services/
│   ├── email.service.ts
│   ├── queue.service.ts
│   └── webhook.service.ts          # NEW: SendGrid webhook handler
├── templates/
│   ├── assignment-reminder.html
│   ├── assignment-overdue.html
│   ├── report-submitted.html
│   ├── report-reviewed.html
│   └── welcome-email.html
├── routes/
│   └── webhooks.ts                  # NEW: Webhook endpoint
└── utils/
    └── template-renderer.ts
```

#### SendGrid Webhooks для Email Delivery Monitoring

**Цель:** Отслеживать delivery rate, bounces, spam complaints для метрик

**SendGrid Events:**
- `delivered` - Email успешно доставлен
- `open` - Email открыт (если tracking enabled)
- `click` - Клик по ссылке
- `bounce` - Hard bounce (невалидный email)
- `dropped` - SendGrid отклонил (spam/unsubscribed)
- `spam_report` - Пользователь отметил как spam
- `unsubscribe` - Отписка от рассылки

**Webhook Endpoint:**
```typescript
// services/notifications/src/routes/webhooks.ts
import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// POST /webhooks/sendgrid
router.post('/sendgrid', async (req, res) => {
  // 1. Verify SendGrid signature
  const signature = req.headers['x-twilio-email-event-webhook-signature'];
  const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'];

  if (!verifySignature(signature, timestamp, req.body)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Process events
  const events = req.body; // Array of events

  for (const event of events) {
    await processWebhookEvent(event);
  }

  res.status(200).json({ received: events.length });
});

async function processWebhookEvent(event: any) {
  const { event: eventType, email, timestamp, notification_id } = event;

  // Update Notification status
  await prisma.notification.update({
    where: { id: notification_id },
    data: {
      status: eventType === 'delivered' ? 'sent' :
              eventType === 'bounce' ? 'failed' :
              'sent',
      sentAt: eventType === 'delivered' ? new Date(timestamp * 1000) : undefined,
    }
  });

  // Track metrics
  await prisma.emailMetric.create({
    data: {
      notificationId: notification_id,
      event: eventType,
      email,
      timestamp: new Date(timestamp * 1000),
      metadata: event,
    }
  });

  // Alert on critical events
  if (eventType === 'bounce' || eventType === 'spam_report') {
    console.warn(`⚠️  Email ${eventType}: ${email}`);
    // TODO: Add alerting (Slack/Telegram)
  }
}

function verifySignature(signature: string, timestamp: string, body: any): boolean {
  const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY!;
  const payload = timestamp + JSON.stringify(body);

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(payload);

  return verifier.verify(publicKey, signature, 'base64');
}

export default router;
```

**Setup SendGrid Webhook:**
```bash
# 1. В SendGrid Dashboard:
#    Settings → Mail Settings → Event Webhook
#    URL: https://yourdomain.com/webhooks/sendgrid
#    Events: delivered, bounce, dropped, spam_report, unsubscribe

# 2. Generate Public Key для signature verification:
#    Settings → Mail Settings → Signed Event Webhook Requests

# 3. Add to .env:
SENDGRID_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

**Metrics Dashboard Query:**
```sql
-- Email Delivery Rate (last 7 days)
SELECT
  DATE(timestamp) as date,
  COUNT(*) FILTER (WHERE event = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE event = 'bounce') as bounced,
  COUNT(*) FILTER (WHERE event = 'dropped') as dropped,
  ROUND(100.0 * COUNT(*) FILTER (WHERE event = 'delivered') / COUNT(*), 2) as delivery_rate
FROM email_metrics
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

**Acceptance Criteria:**
- [ ] Webhook endpoint `/webhooks/sendgrid` создан
- [ ] Signature verification реализован
- [ ] Events обрабатываются и сохраняются в email_metrics
- [ ] Notification status обновляется (sent/failed)
- [ ] Bounce/spam alerts настроены
- [ ] Dashboard query для delivery rate работает
- [ ] Webhook URL зарегистрирован в SendGrid

---

### Задача 3.1.4: Event Consumers
**Приоритет:** P1
**Оценка:** 5 часов
**Зависимости:** 3.1.3

#### Подписка на события из EventOutbox

**События для обработки:**
1. `reports.report.submitted` → Уведомить специалиста
2. `reports.report.reviewed` → Уведомить родителя
3. `assignments.assignment.created` → Запланировать reminder за 24ч
4. `assignments.assignment.status_changed` → Уведомить заинтересованных
5. `assignments.assignment.overdue` → Срочное уведомление

#### Шаблон Event Handler

**📄 Полный шаблон:** [`services/notifications/src/consumers/event-consumer.template.ts`](services/notifications/src/consumers/event-consumer.template.ts)

Шаблон предоставляет:
- ✅ Polling-based architecture (каждые 10 секунд)
- ✅ Batch processing (до 100 событий за раз)
- ✅ Retry logic с экспоненциальным backoff
- ✅ Dead Letter Queue для failed events
- ✅ Graceful shutdown
- ✅ TypeScript типы и JSDoc комментарии
- ✅ Обработчики для 5 базовых событий (с TODO для имплементации)

#### Использование шаблона

```bash
# 1. Скопировать шаблон в ваш сервис
cp services/notifications/src/consumers/event-consumer.template.ts \
   services/notifications/src/consumers/event-consumer.ts

# 2. Реализовать TODO секции (business logic)

# 3. Запустить consumer
cd services/notifications
pnpm exec tsx src/consumers/event-consumer.ts
```

#### Краткий пример архитектуры

```typescript
export class EventConsumer {
  private handlers: Map<string, EventHandler> = new Map();

  async start() {
    while (this.isRunning) {
      const events = await prisma.eventOutbox.findMany({
        where: { status: 'pending' },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });

      for (const event of events) {
        await this.processEventWithRetry(event);
      }

      await sleep(10_000); // 10 seconds
    }
  }

  private async handleReportSubmitted(payload, event) {
    // Create UserNotification
    await prisma.userNotification.create({
      data: {
        userId: payload.specialist_id,
        type: 'report_submitted',
        title: 'Новый отчет',
        body: `Родитель отправил отчет`,
        link: `/dashboard/reports/${payload.report_id}`,
      }
    });

    // Send email if preferences allow
    await emailService.send({ ... });
  }
}
```

#### Acceptance Criteria
- [ ] Consumer запускается в background (setInterval или worker thread)
- [ ] Обработка событий idempotent (можно запускать несколько раз)
- [ ] Error handling: failed events → EventOutboxFailure
- [ ] Logging всех обработанных событий
- [ ] Graceful shutdown

#### Файлы для создания
```
services/notifications/src/
├── consumers/
│   └── event.consumer.ts
├── handlers/
│   ├── report-submitted.handler.ts
│   ├── report-reviewed.handler.ts
│   └── assignment-reminder.handler.ts
└── workers/
    └── consumer.worker.ts
```

---

### Задача 3.1.5: Cron Jobs для Reminders
**Приоритет:** P1
**Оценка:** 4 часа
**Зависимости:** 3.1.3

#### Scheduled Jobs

**Job 1: Assignment Reminders**
- **Schedule:** Каждый час
- **Логика:**
  - Найти все assignments с status = 'scheduled'
  - Due date в течение следующих 24 часов
  - Reminder еще не отправлен (проверка в Notification таблице)
  - Создать notification + отправить email

**Job 2: Overdue Notifications**
- **Schedule:** Каждые 6 часов
- **Логика:**
  - Найти все assignments с status = 'scheduled'
  - Due date < now
  - Обновить status → 'overdue'
  - Отправить notification родителю

**Job 3: Daily Digest для специалистов**
- **Schedule:** Каждый день в 9:00
- **Логика:**
  - Агрегировать pending reports
  - Отправить digest email специалисту
  - "У вас 5 отчетов на проверке"

#### Технические детали
```typescript
// reminder.job.ts
import cron from 'node-cron';

export class ReminderJob {
  start() {
    // Every hour at :00
    cron.schedule('0 * * * *', async () => {
      await this.sendAssignmentReminders();
    });

    // Every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      await this.processOverdueAssignments();
    });

    // Daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      await this.sendDailyDigest();
    });
  }
}
```

#### Acceptance Criteria
- [ ] Cron jobs запускаются автоматически при старте сервиса
- [ ] Logging каждого запуска job
- [ ] Idempotency: можно запускать несколько раз без дубликатов
- [ ] Error handling: не падаем при ошибке в одном job

#### Файлы для создания
```
services/notifications/src/
├── jobs/
│   ├── reminder.job.ts
│   ├── overdue.job.ts
│   └── digest.job.ts
└── scheduler.ts
```

---

## 3.2 Frontend: Notification Center

### Задача 3.2.1: NotificationBell Component
**Приоритет:** P1
**Оценка:** 4 часа
**Зависимости:** 3.1.2

#### UI Спецификация
**Расположение:** Header (рядом с user avatar)

**Компонент:**
- Bell icon 🔔
- Badge с количеством непрочитанных (красный кружок)
- Click → открывает dropdown с последними уведомлениями

**Dropdown содержит:**
- Заголовок "Уведомления"
- Список последних 10 уведомлений
- "Mark all as read" button
- "Посмотреть все" link → /dashboard/notifications

#### API Integration

**⚠️ ВАЖНО:** Использовать **User Notifications API** (UI Layer), а не Delivery API.

```typescript
// Fetch unread count and notifications
GET /user-notifications/v1?limit=10&status=unread

// Mark as read
PATCH /user-notifications/v1/:id/read

// Mark all as read
PATCH /user-notifications/v1/read-all
```

**Response Structure:**
```typescript
interface UserNotification {
  id: string;
  userId: string;
  type: 'assignment_reminder' | 'report_reviewed' | 'route_updated';
  title: string;  // "Напоминание о задании"
  body: string;   // "Сегодня в 15:00 - Пальчиковая гимнастика для Алисы"
  link: string;   // "/dashboard/assignments/uuid"
  status: 'unread' | 'read' | 'archived';
  readAt: string | null;
  createdAt: string;
}
```

#### Acceptance Criteria
- [ ] Badge показывает количество unread (max 99+)
- [ ] Dropdown открывается по клику
- [ ] Уведомления real-time (polling каждые 30 сек или WebSocket)
- [ ] Click на уведомление → PATCH /user-notifications/:id/read + navigate to notification.link
- [ ] Loading state для списка
- [ ] Empty state: "Нет новых уведомлений"
- [ ] Использовать поля title, body, link из API response
- [ ] Иконки по типу: assignment_reminder 📋, report_reviewed ✅, route_updated 🔄

#### Файлы для создания
```
apps/web/src/components/
├── layout/
│   └── Header.tsx (изменить)
└── notifications/
    ├── NotificationBell.tsx
    ├── NotificationDropdown.tsx
    └── NotificationItem.tsx
```

---

### Задача 3.2.2: Notifications Page
**Приоритет:** P2
**Оценка:** 3 часа
**Зависимости:** 3.2.1

#### UI Спецификация
**Страница:** `/dashboard/notifications`

**Фильтры:**
- Все / Непрочитанные
- По типу (assignment, report, system)

**Список уведомлений:**
- Icon по типу уведомления
- Title + body
- Time ago (e.g., "2 часа назад")
- Badge: read/unread
- Click → navigate to target (assignment/report)

#### Acceptance Criteria
- [ ] Pagination или infinite scroll
- [ ] Фильтры работают
- [ ] Bulk actions: "Mark all as read", "Delete all read"
- [ ] Responsive design

---

### Задача 3.2.3: Notification Preferences Page
**Приоритет:** P2
**Оценка:** 3 часов
**Зависимости:** 3.1.2

#### UI Спецификация
**Страница:** `/dashboard/settings/notifications`

**Настройки:**
1. Email notifications (toggle)
   - Assignment reminders
   - Report updates
   - Daily digest
2. In-app notifications (toggle)
3. Quiet hours (time picker: from - to)
4. Frequency (immediate, hourly digest, daily digest)

#### Acceptance Criteria
- [ ] Настройки сохраняются в Notification preferences
- [ ] Toggle switches работают
- [ ] Quiet hours validation (from < to)
- [ ] Preview: "Вы будете получать ~X уведомлений в неделю"

#### API Endpoint

**⚠️ ВАЖНО:** Использовать **Notification Preferences API**.

```typescript
GET   /notification-preferences/v1
PATCH /notification-preferences/v1
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "emailEnabled": true,
    "inAppEnabled": true,
    "assignmentReminders": true,
    "reportUpdates": true,
    "routeChanges": false,
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

#### Файлы для создания
```
apps/web/src/app/dashboard/settings/notifications/
└── page.tsx
```

---

## 3.3 Testing & Documentation

### Задача 3.3.1: E2E Tests для Notifications
**Приоритет:** P2
**Оценка:** 2 часа
**Зависимости:** 3.2.2

#### Тесты
```typescript
test.describe('Notifications', () => {
  test('N-1: Уведомления отображаются в bell', async ({ page }) => {
    // 1. Login
    // 2. Verify bell badge visible
    // 3. Click bell
    // 4. Verify dropdown with notifications
  });

  test('N-2: Mark as read работает', async ({ page }) => {
    // Click notification → verify badge count decreases
  });

  test('N-3: Настройки сохраняются', async ({ page }) => {
    // Navigate to settings
    // Toggle email notifications
    // Save
    // Reload page
    // Verify settings persisted
  });
});
```

---

## Week 3 Deliverables Checklist

### Backend
- [ ] Notifications Service на порту 4011
- [ ] Notifications API (5 endpoints)
- [ ] Email delivery с NodeMailer
- [ ] Email templates (5 types)
- [ ] Event consumers работают
- [ ] Cron jobs для reminders
- [ ] Preferences API
- [ ] Health check

### Frontend
- [ ] NotificationBell в header
- [ ] Notification dropdown
- [ ] Notifications page (/dashboard/notifications)
- [ ] Notification preferences page
- [ ] E2E тесты (3+ тестов)

### Infrastructure
- [ ] Notifications service в docker-compose.yml с healthcheck
- [ ] SMTP credentials configured
- [ ] Email queue (optional: Redis Bull)

**Пример docker-compose.yml с healthcheck:**
```yaml
services:
  notifications:
    build: ./services/notifications
    ports:
      - "4011:4011"
    environment:
      DATABASE_URL: postgres://neiro_user:neiro_password_dev@postgres:5432/neiro_platform
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      SENDGRID_FROM_EMAIL: noreply@neiro.dev
      REDIS_URL: redis://redis:6379  # For email queue (optional)
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4011/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy
```

**Health check endpoint в Notifications Service:**
```typescript
// services/notifications/src/routes/health.ts
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;  // Check DB
    // Optional: check SMTP connection
    const smtpHealthy = await checkSMTPConnection();
    res.status(200).json({
      status: 'healthy',
      smtp: smtpHealthy ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

### Email Delivery
- [ ] SendGrid/AWS SES account setup
- [ ] Test emails отправляются успешно
- [ ] Unsubscribe mechanism работает

---

## Week 3 Exit Criteria (Go/No-Go для Week 4)

### ✅ Must-Have (P0) - блокеры Week 4:
- [ ] **Functional:** Пользователь получает email при новом назначении (assignment created)
- [ ] **Functional:** Пользователь получает email напоминание за 1 день до дедлайна
- [ ] **Functional:** Notification bell показывает unread count и последние 10 уведомлений
- [ ] **Technical:** Notifications Service healthy и отправляет emails < 5 минут с момента события
- [ ] **Technical:** Event consumers обрабатывают EventOutbox events без потерь
- [ ] **Tests:** Минимум 3 E2E теста проходят (bell, notification list, email preferences)

### 📊 Success Metrics (измеримые критерии):
- [ ] **Email Delivery:** >95% emails доставлены успешно (SendGrid webhook confirms)
- [ ] **Latency:** Notifications создаются < 1 секунда после события, отправляются < 5 минут
- [ ] **Test Coverage:** Backend >70%, Frontend >60%
- [ ] **User Experience:** Mark as read работает мгновенно (<100ms), bell badge обновляется

### 📋 Nice-to-Have (P1) - не блокеры:
- [ ] Push notifications (web push)
- [ ] SMS notifications (Twilio)
- [ ] Advanced email templates с HTML+CSS
- [ ] Notification grouping/batching (digest mode)

### 🚨 Red Flags (причины для No-Go в Week 4):
- ❌ Email delivery <80% (блокирует production)
- ❌ Cron jobs не запускаются или запускаются дублированно
- ❌ Event consumers теряют события или обрабатывают дважды
- ❌ Notification preferences не сохраняются

### 🔄 Burn-Down Tracking:
**Запланировано:** 28 часов
**P0 задачи:** 22 часа (79%)
**P1 задачи:** 6 часов (21%)

**Burn-down правило:** Если к середине недели (14ч) выполнено <50% P0 задач, **понизить приоритет Notification Preferences до P2** (можно пропустить UI и использовать дефолтные настройки).

**CRITICAL DECISION POINT:** Notification Preferences (Task 3.2.3, 3.2.4) - сейчас P2. Если Week 3 идет по плану, повысить до P1. Если есть риски, **оставить P2 и пропустить** (дефолт: все уведомления включены).

---

# 📅 WEEK 4: TESTING, POLISH & DOCUMENTATION

**Цель:** Довести до production-ready, 100% test coverage, документация

**Трудозатраты:** 20 часов
**Приоритет:** P1 (высокий)

---

## 4.1 Integration Testing

### Задача 4.1.1: Full E2E Test Suite
**Приоритет:** P0
**Оценка:** 6 часов

#### Тесты для добавления

**Reports Flow (complete):**
- [ ] Parent creates report with media
- [ ] Specialist reviews report
- [ ] Status updates reflected in UI

**Progress Dashboard (complete):**
- [ ] Charts render correctly
- [ ] Data filtering works
- [ ] Specialist can compare children

**Notifications (complete):**
- [ ] Email sent on report submission
- [ ] Reminder sent 24h before due date
- [ ] Bell badge updates in real-time

**Full Integration:**
- [ ] End-to-end: Assignment → Report → Review → Progress update
- [ ] Notification triggers work correctly

#### Acceptance Criteria
- [ ] 60+ E2E тестов проходят (было 53, +7 новых)
- [ ] 100% критических user flows покрыты
- [ ] Screenshots для failing tests
- [ ] Test execution time < 5 минут

---

### Задача 4.1.2: Load Testing (optional)
**Приоритет:** P2
**Оценка:** 3 часа

#### Tools
- **k6** или **Artillery** для load testing

#### Scenarios
1. 100 concurrent users создают отчеты
2. 50 concurrent requests на /analytics/progress
3. 1000 notifications отправляются одновременно

#### Acceptance Criteria
- [ ] API выдерживает 100 RPS без ошибок
- [ ] Latency p95 < 500ms
- [ ] Database connections не исчерпываются

---

## 4.2 Technical Debt & Bug Fixes

### Задача 4.2.1: Исправление TODO из Month 1-2
**Приоритет:** P1
**Оценка:** 4 часа

#### TODO Items
1. **Email Invitations** (`auth.controller.ts:188`)
   - Реализовать отправку приглашений через Notifications Service
   - Template: `welcome-email.html`

2. **Template Versions** (Templates Service)
   - Добавить endpoint `GET /templates/v1/:id/versions`
   - Frontend ожидает этот endpoint (api.ts:370)

3. **PM-2 Test Fix** (Parent Management)
   - Исправить timeout на кнопке "Отмена"
   - Улучшить selector или обработку edge case

#### Acceptance Criteria
- [ ] Все TODO реализованы
- [ ] Failing tests исправлены (PM-2)
- [ ] Code review passed

---

### Задача 4.2.2: Database Optimizations
**Приоритет:** P1
**Оценка:** 2 часа

#### Индексы для добавления

```sql
-- Reports оптимизация
CREATE INDEX idx_reports_assignment_parent ON "Report" ("assignmentId", "parentId");
CREATE INDEX idx_reports_review_status ON "Report" ("reviewStatus", "submittedAt");

-- Notifications оптимизация
CREATE INDEX idx_notifications_user_status ON "Notification" ("userId", "status");
CREATE INDEX idx_notifications_scheduled ON "Notification" ("status", "scheduledAt");
CREATE INDEX idx_notifications_type_date ON "Notification" ("type", "createdAt");

-- Assignments оптимизация для reminders
CREATE INDEX idx_assignments_due_status ON "Assignment" ("status", "dueDate");
```

#### Acceptance Criteria
- [ ] Миграции созданы
- [ ] Индексы применены в prod
- [ ] Query performance улучшился (проверить EXPLAIN)

---

## 4.3 Documentation

### Задача 4.3.1: API Documentation
**Приоритет:** P1
**Оценка:** 3 часа

#### Swagger/OpenAPI для новых сервисов
- [ ] Reports Service - полная спецификация
- [ ] Analytics Service - полная спецификация
- [ ] Notifications Service - полная спецификация

#### Содержание
- Request/Response schemas
- Authentication requirements
- Error codes
- Rate limiting info

---

### Задача 4.3.2: Architecture Documentation
**Приоритет:** P2
**Оценка:** 2 часа

#### Документы для создания

**1. ARCHITECTURE.md**
- Диаграмма микросервисов (12 сервисов)
- Data flow diagrams
- Event-driven architecture (EventOutbox pattern)
- Database schema overview

**2. DEPLOYMENT.md**
- Docker Compose setup
- Environment variables
- Scaling considerations
- Monitoring setup

**3. DEVELOPMENT.md**
- Local setup guide
- Testing strategy
- Code style guide
- Contributing guidelines

#### Файлы для создания
```
/docs/
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── DEVELOPMENT.md
└── API_REFERENCE.md
```

---

## 4.4 Final Polish

### Задача 4.4.1: UI/UX Improvements
**Приоритет:** P2
**Оценка:** 2 часа

#### Items
- [ ] Consistent loading states across all pages
- [ ] Error boundaries для всех routes
- [ ] Toast notifications (success/error) стандартизированы
- [ ] Form validation messages улучшены
- [ ] Mobile responsiveness проверена

---

### Задача 4.4.2: Security Audit
**Приоритет:** P1
**Оценка:** 2 часа

#### Checklist
- [ ] CSRF protection включена
- [ ] Rate limiting на всех endpoints
- [ ] Input validation на всех forms
- [ ] SQL injection защита (Prisma)
- [ ] XSS protection (React escape by default)
- [ ] File upload validation (size, type, virus scan)
- [ ] JWT expiration настроен
- [ ] Secrets в environment variables (не в коде)

---

## Week 4 Deliverables Checklist

### Testing
- [ ] 60+ E2E тестов проходят (100%)
- [ ] Unit-тесты для новых сервисов (>80% coverage)
- [ ] Load testing completed (optional)
- [ ] All critical bugs fixed

### Technical Debt
- [ ] TODO items реализованы
- [ ] Database индексы добавлены
- [ ] Performance optimizations applied

### Documentation
- [ ] API docs (Swagger) для 3 сервисов
- [ ] Architecture documentation
- [ ] Deployment guide
- [ ] Development guide

### Security & Polish
- [ ] Security audit passed
- [ ] UI/UX improvements applied
- [ ] Error handling consistent
- [ ] Mobile responsiveness verified

---

## Week 4 Exit Criteria (GO/NO-GO для Production)

### ✅ Must-Have (P0) - блокеры Production deploy:
- [ ] **Tests:** 60/63 (95%+) E2E тестов проходят стабильно (< 5% flaky rate)
- [ ] **Performance:** All services < 200ms (p95), no memory leaks
- [ ] **Security:** Security audit checklist 100% пройден (CSRF, XSS, SQL injection, file upload validation)
- [ ] **Documentation:** API docs (Swagger) для Reports, Analytics, Notifications готовы
- [ ] **Monitoring:** Health checks для всех 11 сервисов работают
- [ ] **Data Integrity:** Database migrations applied, rollback plan готов

### 📊 Success Metrics (измеримые критерии):
- [ ] **Test Coverage:** Backend >80%, Frontend >70%, E2E >95% passing
- [ ] **Zero Critical Bugs:** No P0 bugs in backlog
- [ ] **API Latency:** p50 < 100ms, p95 < 200ms, p99 < 500ms
- [ ] **Service Availability:** All services healthy для >99% времени за последние 48 часов

### 📋 Nice-to-Have (P1) - можно отложить:
- [ ] Load testing >100 concurrent users
- [ ] Deployment automation (CI/CD)
- [ ] Advanced monitoring (Grafana dashboards)
- [ ] Video upload optimization (compression, transcoding)

### 🚨 Red Flags (причины для NO-GO в Production):
- ❌ >10% E2E тестов падают (flaky или broken)
- ❌ Critical security vulnerabilities не исправлены
- ❌ Memory leaks или p99 latency >2 секунды
- ❌ Data loss scenarios не протестированы
- ❌ No rollback plan или database migration breaks dev environment

### 🔄 Final Burn-Down Tracking:
**Запланировано:** 20 часов
**P0 задачи:** 16 часов (80%) - Testing + Security
**P1 задачи:** 4 часа (20%) - Polish + Documentation

**Decision Point:** Если к концу Week 4 (Day 5) остаются P0 задачи:
1. **Rollback:** Откатить Week 4 changes и deploy Week 1-3 only
2. **Extend:** Добавить Week 4.5 (10 часов) для доработки
3. **Ship with Known Issues:** Document remaining bugs, prioritize for Month 4

### 🎯 Week 4 Success Definition:
**GO для Production:** Все 6 Must-Have критериев выполнены + 0 Critical bugs + >95% E2E passing + Security audit 100%

**Partial Success:** 4/6 Must-Have выполнены → Deploy to Staging only, defer Production to Month 4

**NO-GO:** <4/6 Must-Have → Extend timeline или rollback scope

---

# 🎯 MONTH 3 SUCCESS CRITERIA

## Функциональные требования

### Reports (MUST HAVE)
- [x] Родители могут создавать отчеты
- [x] Upload фото/видео (до 5 файлов)
- [x] Специалисты могут просматривать отчеты
- [x] Специалисты могут оставлять отзывы
- [x] Media отображается в галерее с lightbox

### Analytics (MUST HAVE)
- [x] Progress dashboard для родителей
- [x] Charts (line, pie, bar) работают
- [x] Goals progress отображается
- [x] Specialist overview dashboard
- [x] Comparison между детьми

### Notifications (MUST HAVE)
- [x] Email уведомления доставляются
- [x] Assignment reminders за 24ч
- [x] Report submitted → specialist notified
- [x] Report reviewed → parent notified
- [x] Notification bell в header
- [x] Preferences настраиваются

---

## Технические требования

### Performance
- [ ] API latency p95 < 200ms
- [ ] Page load time < 2 секунды
- [ ] Charts render < 500ms
- [ ] Email delivery < 5 минут

### Reliability
- [ ] 99.9% uptime для всех сервисов
- [ ] Graceful degradation (если сервис упал)
- [ ] Error recovery mechanisms
- [ ] Data consistency (transactions)

### Scalability
- [ ] Поддержка 1000+ users
- [ ] 10000+ assignments в БД
- [ ] 100 RPS на API
- [ ] Email queue не блокируется

### Security
- [ ] HTTPS enabled
- [ ] JWT secure
- [ ] RBAC enforced
- [ ] File upload validated
- [ ] Rate limiting active

---

## Бизнес-метрики

### Engagement
- [ ] 90%+ заданий выполняются вовремя
- [ ] 80%+ отчетов содержат медиа
- [ ] Родители открывают progress ≥2 раз/неделю
- [ ] Специалисты проверяют отчеты в течение 24ч

### User Satisfaction
- [ ] Родители понимают прогресс ребенка
- [ ] Специалисты экономят время на мониторинге
- [ ] Уведомления не spam (unsubscribe rate < 5%)

---

# 📊 РИСКИ И МИТИГАЦИЯ

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| MinIO сложнее ожидаемого | Средняя | Высокое | Копировать код из Exercises service |
| Email попадает в spam | Высокая | Среднее | Использовать SendGrid + правильные headers |
| Event consumers тормозят | Низкая | Высокое | Async processing, job queue |
| Charts медленно рендерятся | Средняя | Среднее | Pagination, data caching |
| Превышение бюджета времени | Средняя | Высокое | Prioritize P0 tasks, defer P2 |

---

# 💰 ОЦЕНКА ТРУДОЗАТРАТ

## Summary
**Total: 124 hours** (31 hours/week)

## Breakdown by Week

| Week | Focus | Hours |
|------|-------|-------|
| Week 1 | Reports Service + File Uploads | 40h |
| Week 2 | Analytics + Progress Dashboards | 36h |
| Week 3 | Notifications + Email Delivery | 28h |
| Week 4 | Testing, Polish, Documentation | 20h |

## Breakdown by Role

| Role | Tasks | Hours |
|------|-------|-------|
| Backend Developer | 3 new services, APIs, event consumers | 62h |
| Frontend Developer | Dashboards, forms, charts, components | 42h |
| Full-Stack | Integration, testing, polish | 20h |

---

# 📦 DELIVERABLES

## Code
1. **3 New Microservices**
   - Reports Service (port 4009)
   - Analytics Service (port 4010)
   - Notifications Service (port 4011)

2. **Frontend Pages**
   - Report submission form
   - Report review dashboard
   - Progress dashboard (parent)
   - Analytics dashboard (specialist)
   - Notifications page
   - Notification preferences

3. **Components**
   - 20+ new React components
   - Charts library integration
   - Media upload component
   - Notification bell

## Infrastructure
4. **Docker Compose**
   - 3 new services added
   - Environment variables configured

5. **Database**
   - Indexes for optimization
   - No new tables (all exist!)

## Documentation
6. **API Documentation**
   - Swagger for 3 services
   - 30+ endpoints documented

7. **Architecture Docs**
   - ARCHITECTURE.md
   - DEPLOYMENT.md
   - DEVELOPMENT.md

## Testing
8. **E2E Tests**
   - 60+ tests (from 53)
   - 100% critical flows covered

9. **Load Tests**
   - Performance benchmarks
   - Scalability validation

---

# 🚀 NEXT STEPS AFTER MONTH 3

## Month 4 Candidates (Prioritized)

### 1. Communications Service (Chat) - P1
- Real-time messaging (Socket.io)
- Chat между родителями и специалистами
- File sharing в чате
- Message history
- Typing indicators

### 2. Advanced Analytics - P2
- AI-powered insights
- Predictive analytics (риск отставания)
- Recommendations engine
- Comparative analytics (ребенок vs. cohort)

### 3. Mobile App - P1
- React Native или Progressive Web App (PWA)
- Push notifications (FCM)
- Offline mode
- Native camera integration

### 4. Reporting & Export - P2
- PDF reports генерация
- Excel export
- Custom report builder
- Scheduled reports (weekly/monthly)

### 5. Billing & Subscriptions - P2
- Stripe integration
- Subscription plans
- Payment history
- Invoicing

---

# 📊 TESTING & BURN-DOWN STRATEGY

## E2E Testing Plan

### Current State (Month 1-2)
- **Total Tests:** 53 E2E tests
- **Passing:** 50/53 (94.3%)
- **Known Issues:** 2 intermittent failures (CJM #2.2, PM-2), 1 missing feature (progress page)

### Month 3 Target
- **Total Tests:** 63+ E2E tests (53 existing + 10+ new)
- **Passing Rate:** >95% (60/63)
- **Flaky Rate:** <5% (max 3 flaky tests)

### New Test Coverage (by week)

**Week 1 - Reports (4+ tests):**
```typescript
// apps/web/e2e/reports.spec.ts
- R-1: Parent can create report for completed assignment
- R-2: Parent can upload photo (1-5 files)
- R-3: Specialist can view reports list
- R-4: Specialist can review report (approve/reject)
- R-5: Media gallery displays uploaded photos
```

**Week 2 - Analytics (3+ tests):**
```typescript
// apps/web/e2e/analytics.spec.ts
- A-1: Parent views child progress dashboard
- A-2: Charts render correctly (line, pie, bar)
- A-3: Specialist views overview dashboard
```

**Week 3 - Notifications (3+ tests):**
```typescript
// apps/web/e2e/notifications.spec.ts
- N-1: Notification bell shows unread count
- N-2: Notification dropdown displays recent notifications
- N-3: Mark as read works correctly
```

### Test Execution Strategy

**Daily Runs:**
- Run full E2E suite each morning (before standup)
- Report failures in team chat
- Fix flaky tests within 24 hours

**Pre-Merge Runs:**
- Run affected tests before merging PR
- Require >95% passing rate to merge

**Parallel Execution:**
```bash
# Current: 1 worker (sequential)
npx playwright test --workers=1

# Optimize for Week 4: 4 workers (parallel)
npx playwright test --workers=4 --retries=2
```

**Expected Duration:**
- Current (53 tests, 1 worker): ~10 minutes
- Target (63 tests, 4 workers): ~5 minutes
- Acceptable: <15 minutes total

---

## Burn-Down Tracking (Weekly)

### Overall Month 3 Budget
- **Total Estimated:** 132 hours (8 pre-work + 124 dev)
- **P0 Tasks:** 100 hours (76%)
- **P1 Tasks:** 24 hours (18%)
- **P2 Tasks:** 8 hours (6%)

### Burn-Down Rules

#### Rule 1: Mid-Week Check (Day 3 of each week)
**If completed < 40% of week's P0 tasks:**
1. Drop all P2 tasks immediately
2. Re-prioritize P1 tasks (keep only must-haves)
3. Escalate to team lead/PM
4. Consider scope reduction

#### Rule 2: End-of-Week Check (Day 5)
**If completed < 75% of week's P0 tasks:**
1. Rollback partially completed features
2. Document remaining work as tech debt
3. Do NOT carry over to next week (clean slate)
4. Adjust scope for upcoming week

#### Rule 3: Weekly Retrospective
After each week, update this document:
- Actual hours vs estimated
- Reasons for deviation
- Adjust estimates for remaining weeks

### Weekly Burn-Down Targets

```
Week 0: 8 hours (100% infrastructure setup)
├─ Day 1-2: MinIO + Redis (4h)
├─ Day 3: SendGrid + SMTP (2h)
└─ Day 4-5: .env + Schema Preview (2h)

Week 1: 40 hours (80% P0, 20% P1)
├─ Day 1-2: Service Setup + CRUD API (16h) ✓ Must complete
├─ Day 3: Media Upload (8h) ✓ Must complete
├─ Day 4: Frontend Components (8h) ✓ Must complete
└─ Day 5: Testing + Integration (8h) ✓ Must complete
Target: 32h P0 done by EOD Day 4

Week 2: 36 hours (83% P0, 17% P1)
├─ Day 1-2: Analytics Service + APIs (14h) ✓ Must complete
├─ Day 3: Redis Caching (6h) ✓ Must complete
├─ Day 4: Frontend Charts (8h) ✓ Must complete
└─ Day 5: Testing + Polish (8h) ✓ Must complete
Target: 28h P0 done by EOD Day 4

Week 3: 28 hours (79% P0, 21% P1)
├─ Day 1-2: Notifications Service + API (10h) ✓ Must complete
├─ Day 3: Email Delivery (6h) ✓ Must complete
├─ Day 4: Frontend Bell + Dropdown (6h) ✓ Must complete
└─ Day 5: Testing + Cron Jobs (6h) ✓ Must complete
Target: 22h P0 done by EOD Day 4

Week 4: 20 hours (80% P0, 20% P1)
├─ Day 1-2: E2E Tests + Bug Fixes (10h) ✓ Must complete
├─ Day 3: Security Audit (4h) ✓ Must complete
└─ Day 4-5: Documentation + Polish (6h) Optional
Target: 14h P0 done by EOD Day 3
```

---

## Risk Mitigation

### High-Risk Areas

**1. File Upload (Week 1)**
- **Risk:** MinIO integration может не работать как ожидается
- **Mitigation:** Test MinIO setup в Week 0, fallback to local storage
- **Contingency:** Use base64 inline storage (temporary)

**2. Email Delivery (Week 3)**
- **Risk:** SendGrid account может не быть готов или blocked
- **Mitigation:** Setup SMTP fallback (Nodemailer + Gmail) в Week 0
- **Contingency:** Log emails to console, deploy notifications без email

**3. E2E Test Stability (Week 4)**
- **Risk:** Flaky tests могут превысить 10%
- **Mitigation:** Fix isolation issues (CJM #2.2) в Week 1-2
- **Contingency:** Document known flaky tests, manual testing for critical paths

**4. Performance Issues (Week 2)**
- **Risk:** Analytics API может быть медленным (>500ms)
- **Mitigation:** Redis caching с самого начала, optimize queries
- **Contingency:** Reduce data granularity (daily instead of hourly)

### Scope Reduction Scenarios

**Scenario A: Week 1 Behind Schedule (>20% delay)**
- Drop video upload support (only photos)
- Drop thumbnail generation (show original images)
- Defer report reviews to Week 2

**Scenario B: Week 2 Behind Schedule**
- Simplify charts (только line chart, no pie/bar)
- Remove specialist dashboard (focus on parent view only)
- Use mock data instead of real-time aggregation

**Scenario C: Week 3 Behind Schedule**
- Remove notification preferences UI (use defaults)
- Simplify email templates (plain text only)
- Defer cron jobs (manual trigger via API)

---

## Quality Gates (GO/NO-GO Checkpoints)

### Daily Quality Gate (Every EOD)
- [ ] All services healthy (`docker-compose ps`)
- [ ] No broken builds (`npm run build` succeeds)
- [ ] New code committed and pushed

### Weekly Quality Gate (Every Friday EOD)
- [ ] Week Exit Criteria met (see Week 1-4 sections above)
- [ ] No regression in existing tests
- [ ] Code reviewed (if team >1 developer)
- [ ] Demo prepared for stakeholder (optional)

### Final Quality Gate (End of Month 3)
- [ ] 60/63 (95%+) E2E tests passing
- [ ] All 11 services healthy
- [ ] Security audit 100% passed
- [ ] API docs complete
- [ ] Zero P0 bugs in backlog

**GO Decision:** If all 5 final gates passed → Production deploy approved

**NO-GO Decision:** If <3/5 gates passed → Defer to Month 4, deploy to Staging only

---

## Decisions Log

**Date: 2025-01-21**
- Выбрали Recharts для charts (уже в dependencies)
- SendGrid для email delivery (vs AWS SES)
- Event-driven notifications вместо direct calls
- Redis caching для analytics (TTL = 5 минут)

## Assumptions
- SendGrid free tier достаточно для dev/test
- MinIO работает аналогично Exercises service
- Existing EventOutbox pattern работает корректно
- Database indexes не требуют downtime

## Open Questions
- [ ] Нужен ли антивирус для file uploads? (ClamAV?)
- [ ] WebSocket для real-time notifications или polling?
- [ ] Separate Redis instance для job queue?
- [ ] Multi-language support (i18n) in scope?

---

**END OF DOCUMENT**

_Created: 2025-01-21_
_Last Updated: 2025-01-21_
_Version: 2.2_
_Status: Planning_

## Changelog

**v2.4 (2025-01-22) - Notifications Split Architecture:**
- ✅ **АРХИТЕКТУРА NOTIFICATIONS**: Реализована двухслойная архитектура согласно NOTIFICATIONS_SPLIT_PROPOSAL.md
- ✅ Task 0.5.1: Добавлены новые модели `UserNotification` (UI layer) и обновлена `Notification` (delivery layer)
- ✅ Task 0.5.1: Добавлена модель `NotificationPreference` с правильными полями (reportUpdates, routeChanges)
- ✅ Section 3.1.2: Notifications API разделён на Delivery API (internal) и User Notifications API (public)
- ✅ Section 3.1.2: Добавлены endpoints `/user-notifications/v1` и `/notification-preferences/v1`
- ✅ Frontend компоненты обновлены: NotificationBell использует User Notifications API
- ✅ UI компоненты: childMood mapping исправлен (3 значения вместо 5: good/neutral/difficult)
- ✅ UI компоненты: Удалены несуществующие поля (engagement, difficulties)
- ✅ Infrastructure: Добавлены примеры healthcheck конфигурации для всех сервисов (Reports, Analytics, Notifications)
- ✅ Все изменения соответствуют Critical Compliance Issue #6 из MONTH_3_COMPLIANCE_REPORT.md

**v2.2 (2025-01-21):**
- ✅ **КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ СХЕМЫ БД**: Task 0.5.1 полностью переписан для соответствия schema.prisma
- ✅ Документированы существующие модели: Report (с JSON media), Notification (с JSON payload), MediaAsset (полиморфная связь)
- ✅ Удалены ссылки на несуществующую модель ReportMedia - используется MediaAsset с ownerType/ownerId
- ✅ Исправлена структура Report: media хранится как JSON array, не FK relation
- ✅ Исправлена структура Notification: данные в payload JSON, не отдельные поля userId/type/subject/body
- ✅ Уточнено: только NotificationPreference требует миграцию, остальные модели УЖЕ существуют
- ✅ Добавлены примеры корректного использования JSON полей и MediaAsset pattern
- ✅ План теперь полностью соответствует текущей документации проекта

**v2.1 (2025-01-21):**
- ✅ Исправлен пароль MinIO: `minioadmin` → `minioadmin123` (соответствие docker-compose.yml)
- ✅ Уточнена конфигурация Redis: добавлена информация о внутреннем (6379) и внешнем (6380) портах
- ✅ Добавлены комментарии о подключении к Redis из контейнеров vs с хоста
- ✅ Проверено соответствие техническому стеку (Node.js 20, TypeScript 5.3.3, PostgreSQL 15)

**v2.0 (2025-01-21):**
- ✅ Added Week 0 (Infrastructure Pre-work) - 8 hours
- ✅ Added Exit Criteria для Week 1-4 с измеримыми метриками
- ✅ Added Burn-Down Tracking с правилами и weekly targets
- ✅ Added E2E Testing Plan (53 → 63 tests, 94.3% → 95%+ passing)
- ✅ Added Risk Mitigation Strategy с contingency plans
- ✅ Added Quality Gates (Daily, Weekly, Final)
- ✅ Clarified Notification Preferences priority (P2 with decision point)
- ✅ Total timeline: 132 hours (8h pre-work + 124h dev)

**v2.3 (2025-01-21) - Compliance Update:**
- ✅ Исправлены критические несоответствия с API_CONTRACTS_MVP.md v0.8
- ✅ POST /reports/v1: правильные поля (durationMinutes, status, feedbackText, childMood values)
- ✅ POST /reports/v1/:id/review: правильные поля (notes вместо specialistNotes)
- ✅ Media Upload: 3-step flow с presigned URLs и confirm endpoint
- ✅ Event names с префиксами: `reports.report.submitted`, `reports.report.reviewed`, `reports.media.attached`
- ✅ Ссылки на соответствующие секции документации
- ✅ Создан MONTH_3_COMPLIANCE_REPORT.md

**v2.2 (2025-01-21) - Schema Compliance:**
- ✅ MinIO credentials исправлены
- ✅ Report.media JSONB формат документирован
- ✅ Polymorphic MediaAsset pattern документирован

**v1.0 (2025-01-21):**
- Initial plan creation
- Week 1-4 tasks breakdown
- API specifications
- File structures
