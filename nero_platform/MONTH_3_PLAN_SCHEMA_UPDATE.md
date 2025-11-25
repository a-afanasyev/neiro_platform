# КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ СХЕМЫ БД ДЛЯ MONTH_3_PLAN.md

**Дата:** 2025-01-21
**Статус:** ТРЕБУЕТСЯ ОБНОВЛЕНИЕ ПЛАНА

## Проблема

MONTH_3_PLAN.md v2.1 содержит схемы моделей, которые **НЕ СООТВЕТСТВУЮТ** текущей Prisma схеме проекта.

## Несоответствия

### 1. Model `Report`

**План предлагает:**
- `childId` - прямая связь с Child
- `notes` - текстовое поле
- `rating` - оценка 1-5
- `media` - связь с ReportMedia[]

**Реальная схема (schema.prisma:501-525):**
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
  media           Json?     @db.JsonB  // ✅ Медиа в JSON!
  autoScore       Decimal?  @map("auto_score") @db.Decimal(5, 2)
  reviewedAt      DateTime? @map("reviewed_at") @db.Timestamptz(6)
  reviewStatus    String    @default("not_reviewed") @map("review_status") @db.VarChar(50)

  assignment Assignment    @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  parent     User          @relation("ParentReports", fields: [parentId], references: [id], onDelete: Restrict)
  reviews    ReportReview[]

  @@map("reports")
}
```

**Ключевые отличия:**
- ✅ Модель УЖЕ существует
- ❌ НЕТ `childId` (child получается через `assignment.childId`)
- ❌ НЕТ `notes` (есть `feedbackText`)
- ❌ НЕТ `rating` (есть `autoScore` Decimal)
- ✅ `media` - это **JSON**, не FK на ReportMedia

---

### 2. Model `ReportMedia`

**План предлагает:**
```prisma
model ReportMedia {
  id          String   @id @default(uuid())
  reportId    String
  type        String   // photo, video
  url         String
  thumbnailUrl String?
  ...
}
```

**Реальность:**
- ❌ Модели `ReportMedia` **НЕ СУЩЕСТВУЕТ**
- ✅ Используется **MediaAsset** (полиморфная связь)

**Существующая модель (schema.prisma:678-689):**
```prisma
model MediaAsset {
  id        String    @id @default(uuid()) @db.Uuid
  ownerType String    @map("owner_type") @db.VarChar(50)  // "report", "exercise", etc.
  ownerId   String    @map("owner_id") @db.Uuid
  mediaType String?   @map("media_type") @db.VarChar(50)
  path      String    @db.VarChar(500)  // Путь в MinIO
  checksum  String?   @db.VarChar(64)
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  expiresAt DateTime? @map("expires_at") @db.Timestamptz(6)

  @@map("media_assets")
}
```

**Правильное использование:**
```typescript
// Для отчета
const mediaAsset = await prisma.mediaAsset.create({
  data: {
    ownerType: 'report',
    ownerId: reportId,
    mediaType: 'photo',
    path: 'reports/uuid-123/photo.jpg'
  }
})
```

---

### 3. Model `Notification`

**План предлагает:**
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String   // FK на User
  type      String   // assignment_reminder, etc.
  channel   String   // in_app, email
  status    String   // pending, sent, failed
  subject   String
  body      String
  metadata  Json?
  sentAt    DateTime?
  readAt    DateTime?  // ❌ Для отслеживания прочитанных
  ...
}
```

**Реальная схема (schema.prisma:696-708):**
```prisma
model Notification {
  id          String    @id @default(uuid()) @db.Uuid
  channel     String    @db.VarChar(50)  // email, sms, in_app, push
  payload     Json      @db.JsonB  // ✅ ВСЕ данные в JSON!
  status      String    @default("pending") @db.VarChar(20)  // pending, sent, failed
  attempts    Int       @default(0)
  scheduledAt DateTime  @map("scheduled_at") @db.Timestamptz(6)
  sentAt      DateTime? @map("sent_at") @db.Timestamptz(6)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("notifications")
}
```

**Ключевые отличия:**
- ✅ Модель УЖЕ существует
- ❌ НЕТ `userId` (находится внутри `payload`)
- ❌ НЕТ `type`, `subject`, `body` (все в `payload`)
- ❌ НЕТ `readAt` (это отдельная логика, не в Notification)
- ✅ Используется `payload: Json` для гибкости

**Пример payload:**
```json
{
  "userId": "uuid-123",
  "type": "assignment_reminder",
  "subject": "Напоминание о задании",
  "body": "Через 1 час начало занятия",
  "metadata": {
    "assignmentId": "uuid-456"
  }
}
```

---

### 4. Model `NotificationPreference`

**План предлагает:**
```prisma
model NotificationPreference {
  id                 String   @id @default(uuid())
  userId             String   @unique
  emailEnabled       Boolean  @default(true)
  inAppEnabled       Boolean  @default(true)
  assignmentReminders Boolean @default(true)
  reportSubmitted    Boolean  @default(true)
  reportReviewed     Boolean  @default(true)
  ...
}
```

**Реальность:**
- ❌ Модели **НЕ СУЩЕСТВУЕТ**
- ✅ Требуется создать миграцию

---

## Рекомендации

### Вариант 1: Использовать существующие модели (РЕКОМЕНДУЕТСЯ)

**Преимущества:**
- ✅ Не требуется миграция БД
- ✅ Совместимо с Month 1-2
- ✅ Быстрее в реализации

**Изменения в плане:**

#### Week 1 - Reports Service

1. **Report.media** - использовать JSON:
```typescript
// POST /reports/v1
{
  "assignmentId": "uuid",
  "feedbackText": "Отлично справился!",
  "childMood": "good",
  "status": "completed",
  "durationMinutes": 25,
  "media": [
    {
      "url": "https://minio.neiro.dev/reports/uuid-123/photo1.jpg",
      "type": "photo",
      "thumbnailUrl": "https://minio.neiro.dev/thumbnails/uuid-123-thumb.jpg"
    }
  ]
}
```

2. **MediaAsset** - создавать записи для MinIO:
```typescript
await prisma.mediaAsset.create({
  data: {
    ownerType: 'report',
    ownerId: reportId,
    mediaType: 'photo',
    path: `reports/${reportId}/photo1.jpg`
  }
})
```

#### Week 3 - Notifications Service

1. **Notification.payload** - использовать JSON:
```typescript
await prisma.notification.create({
  data: {
    channel: 'email',
    status: 'pending',
    scheduledAt: new Date(),
    payload: {
      userId: 'uuid-123',
      type: 'assignment_reminder',
      subject: 'Напоминание',
      body: 'Через 1 час занятие',
      metadata: { assignmentId: 'uuid-456' }
    }
  }
})
```

2. **readAt tracking** - использовать отдельную таблицу или EventOutbox

---

### Вариант 2: Создать миграцию (НЕ РЕКОМЕНДУЕТСЯ)

**Недостатки:**
- ❌ Ломает существующий код Month 1-2
- ❌ Требует обновления seed.ts
- ❌ Требует обновления всех сервисов

---

## Действия

1. ✅ Обновить MONTH_3_PLAN.md v2.1 → v2.2
2. ✅ Заменить "Новые модели" на "Использование существующих моделей"
3. ✅ Обновить API спецификации под текущую схему
4. ✅ Обновить примеры кода
5. ✅ Обновить Changelog

---

## Файлы для изменения

- [ ] MONTH_3_PLAN.md (sections 0.5, Week 1, Week 3)
- [ ] API examples в Week 1 Task 1.1.2
- [ ] Media Upload strategy Week 1 Task 1.1.3
- [ ] Notifications API Week 3 Task 3.1.1

---

**Автор:** Claude Code
**Ревьюер:** Andrey Afanasyev
