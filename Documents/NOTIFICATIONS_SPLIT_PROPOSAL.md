# Notifications Split Architecture Proposal

## Summary
- **Problem:** `MONTH_3_PLAN.md:1596-1957` описывает in-app уведомления (read/unread, UI-список) как будто это те же сущности, что и delivery-очередь `Notification` в `packages/database/prisma/schema.prisma:695-707`. В `MONTH_3_COMPLIANCE_REPORT.md:175-217` отмечено критическое расхождение с API_CONTRACTS_MVP (section 17).
- **Goal:** Развести транспортный слой (delivery tracking) и UI-слой (прочитано/непрочитано) так, чтобы фронтенд взаимодействовал только с user-facing API, а сервис уведомлений продолжал заниматься доставкой писем/SMS/push.
- **Deliverable:** согласуемое архитектурное решение с описанием сущностей, API, миграций и плана внедрения.

## Background
1. **Current storage:** таблица `notifications` содержит задания на доставку (канал, payload JSON, статус). Статуса `read/unread` нет — они относятся к UI, а не к доставке.
2. **Frontend contract:** Week 3 backlog требует `GET /notifications/v1`, `PATCH /notifications/v1/:id/read` и т.п., а также “notification bell” и страницу `/dashboard/notifications`. Эти эндпоинты должны возвращать агрегированные данные с заголовком/текстом и read-статусом.
3. **Delivery contract:** API_CONTRACTS описывает сущность `Notification` (recipientId, channel, template, payload, status pending/sent/failed/bounced). Эти данные нужны сервисам, а не UI.
4. **Gap:** сейчас нет таблицы, где бы хранилось UI-представление уведомлений, нет preferences API и нет четкой границы ответственности.

## Goals & Non-Goals
**Goals**
1. Ввести отдельные таблицы/модели `notifications` (delivery) и `user_notifications` (UI) + `notification_preferences`.
2. Определить API/ownership каждого слоя, чтобы Month 3 можно было реализовать без нарушений контрактов.
3. Обозначить миграции и риски (в том числе обратную совместимость с seed/custom scripts).

**Non-Goals**
- Реализация конкретных UI-компонентов (CreateAssignmentDialog, DashboardLayout и т.д.).
- Интеграция с push/SMS провайдерами — они остаются внутри delivery слоя.

## Architecture Overview
| Слой | Таблица / сущность | Ответственный сервис | Описание |
| --- | --- | --- | --- |
| Delivery (transport) | `notifications` | `services/notifications` | Очередь фактической отправки писем/SMS/push, статусы pending/sent/failed/bounced, попытки отправки, ссылки на шаблоны |
| UI (read state) | `user_notifications` | `services/users` (REST API) + `services/notifications` (пишет) | Материализованный список уведомлений для интерфейса (title/body/link, read/unread/deleted, привязка к пользователю) |
| Preferences | `notification_preferences` | `services/users` | Гранулярное включение каналов/типов событий пользователем |

### Data Model
#### Delivery queue (existing + delta)
```prisma
// packages/database/prisma/schema.prisma:695-707
model Notification {
  id          String    @id @default(uuid()) @db.Uuid
  channel     String    @db.VarChar(50)
  payload     Json      @db.JsonB
  status      String    @default("pending") @db.VarChar(20)
  attempts    Int       @default(0)
  scheduledAt DateTime  @map("scheduled_at") @db.Timestamptz(6)
  sentAt      DateTime? @map("sent_at") @db.Timestamptz(6)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  // delta (migration): добавить recipientId, template, lastError чтобы 1:1 соответствовать API_CONTRACTS
}
```

#### In-app notifications (new)
```prisma
model UserNotification {
  id              String    @id @default(uuid()) @db.Uuid
  userId          String    @map("user_id") @db.Uuid
  notificationId  String?   @map("notification_id") @db.Uuid
  type            String    @db.VarChar(50)     // assignment_reminder, report_reviewed...
  title           String    @db.VarChar(150)
  body            String?   @db.Text
  link            String?   @db.VarChar(255)
  status          String    @default("unread") @db.VarChar(20) // unread|read|archived
  importance      String    @default("normal") @db.VarChar(20) // normal|high
  payload         Json?     @db.JsonB
  readAt          DateTime? @map("read_at") @db.Timestamptz(6)
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz(6)

  @@map("user_notifications")
  @@index([userId, status])
  @@index([notificationId])
}
```

#### Notification preferences (new)
```prisma
model NotificationPreference {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @unique @map("user_id") @db.Uuid
  emailEnabled Boolean  @default(true) @map("email_enabled")
  smsEnabled   Boolean  @default(false) @map("sms_enabled")
  inAppEnabled Boolean  @default(true) @map("in_app_enabled")
  pushEnabled  Boolean  @default(false) @map("push_enabled")
  assignmentReminders Boolean @default(true) @map("assignment_reminders")
  reportUpdates       Boolean @default(true) @map("report_updates")
  routeChanges        Boolean @default(true) @map("route_changes")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@map("notification_preferences")
}
```

### API Surface
**Delivery service (`services/notifications`, internal)**
- `POST /notifications/v1` — ставит рассылку в очередь (`Notification`), возвращает ID и статус.
- `GET /notifications/v1/:id` — техническая телеметрия (до API Gateway).
- Webhooks/cron доставляют письма/SMS, обновляя `status`, `attempts`, `lastError`.

**User notifications API (`services/users` or gateway facade)**
- `GET /user-notifications/v1` → страница `/dashboard/notifications`.
- `PATCH /user-notifications/v1/:id/read` и `PATCH /user-notifications/v1/read-all`.
- `DELETE /user-notifications/v1/:id` (soft delete → `deletedAt`).
- `GET /notification-preferences/v1` и `PATCH /notification-preferences/v1`.

**Event ingestion workflow**
1. Доменные сервисы (`assignments`, `reports`, `routes`) публикуют событие через Redis Stream или RabbitMQ (уже запланировано в MONTH_3_PLAN.md:1696).
2. Notifications orchestrator конвертирует событие в:
   - Delivery job (`Notification` + template + payload).
   - Record в `UserNotification` (title/body/link/read state).
3. UI дергает только `user-notifications` API; при клике → `PATCH .../read` и при необходимости открывает link.
4. Preferences учитываются на этапе генерации обоих артефактов.

### Data Flow (textual sequence)
1. `services/routes` создаёт новую задачу → публикует событие `route.assignment_due`.
2. `notifications worker` читает событие, проверяет настройки получателя:
   - если email включён → `Notification` с channel=email, template=`assignment_reminder`.
   - независимо от доставки создаётся `UserNotification` (type=`assignment_reminder`, status=`unread`).
3. Cron отправляет email, обновляет `Notification.status=sent`.
4. Пользователь открывает колокольчик → `GET /user-notifications/v1` возвращает список с `status`.
5. Клиент вызывает `PATCH /user-notifications/v1/:id/read`, сервис обновляет `readAt` и вычитает badge count.

## Migration & Rollout Plan
1. **Schema migration**
   - Add missing columns (`recipient_id`, `template`, `last_error`) to `notifications`.
   - Create tables `user_notifications` и `notification_preferences`.
   - Backfill script (if historical Notifications exist) копирует агрегированные данные в `user_notifications`.
2. **Service responsibilities**
   - Extend `services/notifications` writers to insert into both tables.
   - `services/users` expose REST endpoints for UI (bell/list/preferences).
3. **Frontend switch**
   - Dashboard bell и страницы `/dashboard/notifications` / `/dashboard/settings/notifications` обращаются к новым endpoints (no direct use of delivery schema).
4. **Cleanup**
   - Удалить UI-зависимые поля из payload контрактов (title/body/read state остаются только в `user_notifications`).
   - Обновить `MONTH_3_PLAN.md` и `API_CONTRACTS_MVP` в тех местах, где `GET /notifications/v1` описывает delivery сущность.

## Impacted Components
- `packages/database/prisma/schema.prisma` + новая миграция.
- `services/notifications` (producers/cron workers) и `services/users` (REST).
- Seed (`packages/database/prisma/seed.ts`) — добавить тестовые user notifications/preferences.
- Frontend (`apps/web/src/components/layout/DashboardLayout.tsx`, `/dashboard/notifications`, `/dashboard/settings/notifications`) — новые endpoints и DTO.

## Risks & Mitigations
| Risk | Description | Mitigation |
| --- | --- | --- |
| Drift между таблицами | Delivery job может существовать без UI записи (или наоборот) | Транзакция/сервисный слой, который создает обе записи атомарно; миграционные скрипты с валидацией |
| Увеличение нагрузки | Две таблицы + индексы → больше IO | Использовать `@@index([userId, status])`, ограничить payload размер, архивировать старые записи (>90 дней) |
| Preferences недоступны | До миграции UI может показывать уведомления, которые пользователь отключил | Бэкэнд должен проверять `notification_preferences` до создания `Notification`/`UserNotification`; временно дефолт `true` |

## Open Questions / Approval Items
1. Кто владеет REST API для user notifications? (предложение — `services/users`, так как UI уже общается с ним).
2. Нужно ли синхронизировать `recipientId` с `userId` (1:1) или нам нужно поддерживать группы получателей?
3. Должны ли `user_notifications` хранить `notification_id` всегда, или допускаем UI-специфические уведомления без доставки (например, внутри продукта)?

## Next Steps
1. Утвердить архитектуру (этот документ) с архитектором/PM.
2. Добавить задачи в MONTH_3_PLAN Week 3:
   - миграция схемы;
   - обновление API контрактов;
   - фронтенд switch.
3. После согласования — создать ADR либо включить раздел в `MONTH_3_PLAN_SCHEMA_UPDATE.md`.
