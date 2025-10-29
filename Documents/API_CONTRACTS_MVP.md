# Neiro Platform — API Contracts (MVP)

**Версия:** 0.6
**Дата обновления:** 28 октября 2025
**Предыдущая версия:** 0.5 (11 января 2025)
**Назначение:** описание REST/tRPC эндпоинтов MVP с версионированием, статусами ответов и правилами валидации. Документ служит основой для OpenAPI 3.1 спецификаций и реализации tRPC роутеров.

> Документ является приложением к SoT `ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md` и обновляется в соответствии с `DOCUMENTATION_UPDATE_GUIDELINE.md`.

---

## 📖 Содержание

1. [Общие положения](#1-общие-положения)
2. [Auth Service](#2-auth-service)
3. [Users & Profiles](#3-users--profiles)
   - [3.1. Specialists Service](#31-specialists-service)
4. [Children Service](#4-children-service)
5. [Diagnostics Service](#5-diagnostics-service)
6. [Route Orchestrator](#6-route-orchestrator)
7. [Exercises Service](#7-exercises-service)
   - [7.1. Route Templates Service](#71-route-templates-service)
8. [Assignments Service](#8-assignments-service)
9. [Reports Service](#9-reports-service)
10. [Communications Service](#10-communications-service)
11. [Analytics Service](#11-analytics-service)
12. [Media & Storage Service](#12-media--storage-service)
13. [Webhook System](#13-webhook-system)
14. [Security & Compliance API](#14-security--compliance-api)
15. [PWA Service](#15-pwa-service)
16. [Enhanced Analytics Service](#16-enhanced-analytics-service)
17. [Интеграции и расширения (Roadmap)](#17-интеграции-и-расширения-roadmap)
   - [17.1. Telegram Bot Integration](#171-telegram-bot-integration)
   - [17.2. WebRTC Video Service](#172-webrtc-video-service)
   - [17.3. Gamification Service](#173-gamification-service)
   - [17.4. Offline Sync Service](#174-offline-sync-service)
18. [tRPC Namespace](#18-trpc-namespace)
19. [Общие схемы данных](#19-общие-схемы-данных)
20. [Следующие шаги](#20-следующие-шаги)
21. [Changelog](#21-changelog)

---

## 1. Общие положения

### 1.1 Базовые параметры
- **API Gateway / BFF:** `https://api.neiro.dev/v1` (версия по пути)
- **tRPC Namespace:** `/trpc` (для Next.js BFF)
- **Аутентификация:**
  - OAuth2 Password Grant + Refresh Token
  - Email Magic Link (опционально для родителей)
  - JWT Access Token (TTL: 15 мин) + Refresh Token (TTL: 30 дней)
  - Header: `Authorization: Bearer <access_token>`
- **Формат:** JSON UTF-8
- **Даты/время:** ISO 8601 (UTC), например: `2025-01-11T10:30:00Z`
- **Идентификаторы:** UUID v7 (time-ordered)

### 1.2 Формат ошибок

Все ошибки возвращаются в формате **RFC 7807** (`application/problem+json`):

```json
{
  "type": "https://api.neiro.dev/problems/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request body contains invalid fields",
  "instance": "/children/v1/123e4567-e89b-12d3-a456-426614174000",
  "errors": {
    "birthDate": ["Must not be in the future"],
    "parents": ["At least one legal guardian is required"]
  },
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Поля:**
- `type` — URI ссылка на описание проблемы
- `title` — краткое описание типа ошибки
- `status` — HTTP статус код
- `detail` — детальное описание конкретной ошибки
- `instance` — путь к ресурсу, где произошла ошибка
- `errors` — map полей к сообщениям валидации
- `traceId` — для корреляции с логами (UUID)

### 1.3 HTTP статусы

| Код | Назначение | Пример |
|-----|------------|--------|
| 200 | OK | Успешное получение/обновление |
| 201 | Created | Создан новый ресурс |
| 202 | Accepted | Запрос принят на асинхронную обработку |
| 204 | No Content | Успешно, тело ответа пустое (logout) |
| 400 | Bad Request | Ошибка валидации |
| 401 | Unauthorized | Неверные креды или токен |
| 403 | Forbidden | Недостаточно прав |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Конфликт состояния (дубликат) |
| 422 | Unprocessable Entity | Бизнес-логика запрещает операцию |
| 423 | Locked | Пользователь заблокирован |
| 429 | Too Many Requests | Rate limit превышен |
| 500 | Internal Server Error | Внутренняя ошибка сервера |
| 503 | Service Unavailable | Сервис временно недоступен |

### 1.4 Пагинация

**Cursor-based pagination** для всех списковых эндпоинтов:

**Запрос:**
```
GET /children/v1?limit=20&cursor=eyJpZCI6IjEyMyJ9
```

**Ответ:**
```json
{
  "data": [ /* массив элементов */ ],
  "meta": {
    "total": 156,
    "hasMore": true,
    "nextCursor": "eyJpZCI6IjE0MyJ9"
  }
}
```

**Параметры:**
- `limit` — количество элементов (по умолчанию: 20, max: 100)
- `cursor` — base64-encoded указатель на позицию

### 1.5 Роли и права доступа

| Роль | Описание | Доступ |
|------|----------|--------|
| `parent` | Родитель/опекун ребенка | Свои дети, назначения, отчеты |
| `specialist` | Нейропсихолог/логопед/дефектолог | Назначенные дети, маршруты, упражнения |
| `supervisor` | Методист/супервизор | Просмотр всех карт, консультации |
| `admin` | Администратор системы | Полный доступ, управление пользователями |

**Обозначение в OpenAPI:**
```yaml
security:
  - bearerAuth: []
x-roles: [specialist, admin]
```

### 1.6 Rate Limiting

**Лимиты по умолчанию:**
- Аутентификация: 5 запросов/мин
- API запросы: 100 запросов/мин (авторизованные)
- Upload: 10 файлов/час

**Заголовки ответа:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1641902400
```

**При превышении:**
```json
{
  "type": "https://api.neiro.dev/problems/rate-limit",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Too many requests. Please try again in 42 seconds",
  "retryAfter": 42
}
```

### 1.7 Performance Requirements

**Требования к производительности (SOT §5.1):**
- Время отклика API: < 500ms для 95% запросов
- Время загрузки главной страницы: < 2 секунд
- Поддержка 1000+ одновременных пользователей
- Масштабируемость до 10,000+ пользователей

**Мониторинг производительности:**
```
X-Response-Time: 245ms
X-Cache-Status: HIT
X-Database-Queries: 3
X-Processing-Time: 180ms
```

**SLO (Service Level Objectives):**
- Availability: 99.9% (8.76 часов простоя в год)
- Error Rate: < 0.1% (4xx/5xx ошибки)
- P95 Latency: < 500ms
- P99 Latency: < 1000ms

### 1.8 Валидация

**Общие правила:**
- Выполняется на API Gateway и повторяется в сервисах
- Email: RFC 5322
- Phone: E.164 формат (например, `+998901234567`)
- Timezone: IANA список (например, `Asia/Tashkent`)
- Строковые поля: trim whitespace на краях
- Обязательные поля обозначены `*`

**Constitution Check правила (из DATA_MODEL_AND_EVENTS.md):**
- **Фаза без маршрута недопустима:** `phase.route_id` обязательно
- **Упражнение не должно «висеть» вне фазы:** все упражнения в маршруте должны быть привязаны к фазам
- **Цель не может существовать без маршрута:** `goal.route_id` обязательно
- **Назначение только в контексте маршрута:** `assignment.phase_id` обязательно, проверка принадлежности к маршруту
- **Упражнение должно быть связано с целью:** валидация через `goal_exercises`
- **Нельзя активировать пустой маршрут:** минимум одна фаза, одна цель, упражнения в фазах
- **Единственный активный маршрут на ребенка:** UNIQUE constraint на уровне БД
- **Уникальность и порядок фаз:** `phase.order_index` уникален в рамках маршрута
- **Целостность при редактировании маршрута:** сохранение истории версий
- **Валидация ссылок на справочники:** все FK должны ссылаться на существующие сущности

---

## 2. Auth Service

### POST `/auth/v1/login`
- **Описание:** Аутентификация пользователя по email/паролю.
- **Запрос:**
  ```json
  {
    "email": "user@example.com",
    "password": "string(min=8,max=128)"
  }
  ```
- **Правила:** email валидируется по RFC 5322; пароль — не пустой, без пробелов на краях.
- **Ответ 200:**
  ```json
  {
    "accessToken": "JWT",
    "refreshToken": "JWT",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "role": "parent",
      "status": "active",
      "firstName": "string",
      "lastName": "string"
    }
  }
  ```
- **Ошибки:** 400 (валидация), 401 (неверные креды), 423 (пользователь заблокирован).

### POST `/auth/v1/refresh`
- **Описание:** Обновление access token.
- **Запрос:** `{ "refreshToken": "JWT" }`
- **Ответ 200:** новый access/refresh.
- **Ошибки:** 401 (истек/отозван), 400 (некорректный формат).

### POST `/auth/v1/logout`
- **Описание:** Инвалидация refresh токена, требует авторизации.
- **Ответ:** 204 без тела.

### POST `/auth/v1/invite`
- **Роль:** `admin`.
- **Запрос:** `{ "email": "user@example.com", "role": "specialist", "firstName": "...", "lastName": "..." }`
- **Ответ 201:** `{ "userId": "uuid", "invitedAt": "2025-01-11T10:00:00Z" }`
- **Примечания:** триггерит событие `auth.user.invited`.

---

## 3. Users & Profiles

### GET `/users/v1/me`
- **Описание:** Профиль текущего пользователя.
- **Ответ 200:** профиль + связанные организации.

### PATCH `/users/v1/me`
- **Описание:** Обновление собственных данных.
- **Запрос:** частичное обновление (JSON Merge Patch). Разрешены поля: `firstName`, `lastName`, `phone`, `timezone`, `avatar`.
- **Валидация:** `phone` — E.164, `timezone` — из IANA списка.
- **Ответ 200:** обновленный профиль.

### GET `/users/v1/:id`
- **Роль:** `admin` или участники команды ребенка (для родителей/специалистов).
- **Ответ 200:** расширенный профиль (без паролей).

### PATCH `/users/v1/:id/status`
- **Роль:** `admin`.
- **Запрос:** `{ "status": "active|suspended", "reason": "string?"" }`
- **Ответ:** 200 → новый статус. 409 если уже в таком статусе.

---

## 3.1. Specialists Service

### GET `/specialists/v1/me`
- **Роль:** `specialist | supervisor`.
- **Описание:** Профиль текущего специалиста.
- **Ответ 200:** профиль специалиста + связанные дети.

### PATCH `/specialists/v1/me`
- **Роль:** `specialist | supervisor`.
- **Описание:** Обновление собственного профиля специалиста.
- **Запрос:** частичное обновление (JSON Merge Patch). Разрешены поля: `specialty`, `licenseNumber`, `licenseValidUntil`, `experienceYears`, `bio`.
- **Валидация:** `licenseValidUntil` — дата в будущем, `experienceYears` ≥ 0.
- **Ответ 200:** обновленный профиль.

### GET `/specialists/v1/:id`
- **Роль:** `admin` или участники команды ребенка.
- **Ответ 200:** профиль специалиста + статистика работы.

### POST `/specialists/v1/:id/assign-to-child`
- **Роль:** `admin | supervisor`.
- **Запрос:**
  ```json
  {
    "childId": "uuid",
    "specialization": "lead|speech|aba|occupational|supervisor|other",
    "isPrimary": false,
    "roleDescription": "string<=512"
  }
  ```
- **Ответ 201:** `{ "assignmentId": "uuid", "assignedAt": "..." }`
- **Событие:** `specialists.assignment.created`.

### DELETE `/specialists/v1/:id/release-from-child`
- **Роль:** `admin | supervisor`.
- **Запрос:** `{ "childId": "uuid", "reason": "string<=256" }`
- **Ответ:** 200. Триггерит `specialists.assignment.released`.

---

## 4. Children Service

### POST `/children/v1`
- **Роль:** `specialist | admin`.
- **Запрос:**
  ```json
  {
    "firstName": "string(1..64)",
    "lastName": "string(1..64)",
    "birthDate": "YYYY-MM-DD",
    "gender": "male|female|other",
    "diagnosisSummary": "string<=1024",
    "notes": "string<=2048",
    "parents": [
      {
        "userId": "uuid",
        "relationship": "mother|father|guardian|other",
        "legalGuardian": true
      }
    ]
  }
  ```
- **Валидация:** `birthDate` не в будущем, минимум один законный представитель.
- **Ответ 201:** `{ "id": "uuid" }`

### GET `/children/v1/:id`
- **Роль:** участники семьи/команды + `admin`.
- **Ответ 200:** профиль, родители, специалисты, активный маршрут.
- **Ошибки:** 404 (нет доступа или не найден).

### PATCH `/children/v1/:id`
- **Роль:** ведущий специалист (`is_primary`), `supervisor`, `admin`.
- **Правила:** те же ограничения, нельзя удалить последнего опекуна.
- **Ответ 200:** обновленный объект.

### POST `/children/v1/:id/archive`
- **Роль:** `admin`.
- **Ответ:** 202 (архивация асинхронная, триггерит пересылку данных в архив).

---

## 5. Diagnostics Service

### POST `/diagnostics/v1/sessions`
- **Роль:** `specialist`.
- **Запрос:**
  ```json
  {
    "childId": "uuid",
    "questionnaireCode": "MCHAT_R_F",
    "performedBy": "uuid",
    "metadata": {
      "context": "in_clinic|remote",
      "notes": "string<=1024"
    }
  }
  ```
- **Ответ 201:** `{ "sessionId": "uuid", "status": "in_progress" }`
- **Валидация:** ребенок связан со специалистом; одновременно не больше одной активной сессии для пары `(childId, questionnaireCode)`.

### GET `/diagnostics/v1/sessions/:id`
- **Роль:** причастные специалисты, родители (только результаты).
- **Ответ 200:** данные сессии + результаты.

### PATCH `/diagnostics/v1/sessions/:id`
- **Описание:** обновление статуса (`in_progress → completed/cancelled`), запись результатов.
- **Запрос:** `{ "status": "completed", "score": {...}, "answers": {...}, "completedAt": "..." }`
- **Валидация:** при `status=completed` требуются `answers` и `score`.
- **Ответ:** 200. Триггерит `diagnostics.session.completed` + `diagnostics.recommendations.generated`.

### GET `/diagnostics/v1/children/:childId/history`
- **Роль:** специалисты/родители.
- **Ответ 200:** список сеансов, пагинация `?limit=20&cursor=...`.

---

## 6. Route Orchestrator

### POST `/routes/v1`
- **Роль:** `specialist`.
- **Запрос:**
  ```json
  {
    "childId": "uuid",
    "title": "string<=128",
    "summary": "string<=1024",
    "goals": [
      {
        "category": "speech|motor|social|cognitive|sensory|daily",
        "description": "string<=512",
        "targetMetric": "string<=128",
        "baselineValue": "string<=64",
        "targetValue": "string<=64",
        "priority": "high|medium|low"
      }
    ],
    "phases": [
      {
        "name": "string<=64",
        "description": "string<=512",
        "order": 1,
        "durationWeeks": 4,
        "milestones": [ "string<=128" ]
      }
    ]
  }
  ```
- **Валидация:** `goals` ≥ 1, `phases` ≥ 1. `order` начинается с 1.
- **Ответ 201:** `{ "routeId": "uuid", "status": "draft" }`

### GET `/routes/v1/:id`
- **Ответ 200:** маршрут + цели, фазы, статистика выполнения.

### PATCH `/routes/v1/:id`
- **Описание:** частичные обновления (JSON Patch).
- **Доп. правила:** нельзя активировать, если нет хотя бы одной цели и активного специалиста.

### POST `/routes/v1/:id/activate`
- **Валидация:** наличие связанного диагностического сеанса ≤ 60 дней, отсутствие другого активного маршрута.
- **Ответ:** 200 `{ "status": "active", "activatedAt": "…" }`

### POST `/routes/v1/:id/complete`
- **Ответ:** 200 `{ "status": "completed", "completedAt": "...", "outcomeSummary": "..." }`

### GET `/routes/v1/children/:childId`
- **Ответ:** список маршрутов по ребенку, фильтр `status`.

### POST `/routes/v1/:routeId/phases`
- **Роль:** `specialist`.
- **Запрос:**
  ```json
  {
    "name": "string<=64",
    "description": "string<=512",
    "orderIndex": 1,
    "parallelGroup": 1,
    "durationWeeks": 4,
    "responsibleSpecialistId": "uuid",
    "expectedOutcomes": "string<=1024",
    "notes": "string<=512"
  }
  ```
- **Валидация:** `orderIndex` уникален в рамках маршрута, `responsibleSpecialistId` должен быть участником команды.
- **Ответ 201:** `{ "phaseId": "uuid", "createdAt": "..." }`
- **Событие:** `routes.phase.created`.

### GET `/routes/v1/:routeId/phases`
- **Ответ:** список фаз маршрута с пагинацией.

### PATCH `/routes/v1/:routeId/phases/:phaseId`
- **Роль:** `specialist`.
- **Запрос:** частичное обновление фазы.
- **Валидация:** нельзя изменить `orderIndex` если фаза активна.
- **Ответ 200:** обновленная фаза.

### POST `/routes/v1/:routeId/phases/:phaseId/status`
- **Запрос:** `{ "status": "planned|active|on_hold|completed", "reason": "string?" }`
- **Ответ 200:** новый статус фазы.
- **Событие:** `routes.phase.status_changed`.

### POST `/routes/v1/:routeId/goals`
- **Роль:** `specialist`.
- **Запрос:**
  ```json
  {
    "phaseId": "uuid?",
    "category": "speech|motor|social|cognitive|sensory|daily",
    "goalType": "skill|behaviour|academic|other",
    "description": "string<=512",
    "targetMetric": "string<=128",
    "measurementUnit": "string<=50",
    "baselineValue": "string<=64",
    "targetValue": "string<=64",
    "reviewPeriodWeeks": 4,
    "priority": "high|medium|low"
  }
  ```
- **Валидация:** `phaseId` опционально, если NULL — цель относится ко всему маршруту.
- **Ответ 201:** `{ "goalId": "uuid", "createdAt": "..." }`

### GET `/routes/v1/:routeId/goals`
- **Ответ:** список целей маршрута.

### PATCH `/routes/v1/:routeId/goals/:goalId`
- **Роль:** `specialist`.
- **Запрос:** частичное обновление цели.
- **Ответ 200:** обновленная цель.

### POST `/routes/v1/:routeId/goals/:goalId/status`
- **Запрос:** `{ "status": "not_started|in_progress|achieved|modified", "reason": "string?" }`
- **Ответ 200:** новый статус цели.
- **Событие:** `routes.goal.status_changed`.

### POST `/routes/v1/:routeId/phases/:phaseId/milestones`
- **Роль:** `specialist`.
- **Запрос:**
  ```json
  {
    "goalId": "uuid?",
    "title": "string<=128",
    "description": "string<=512",
    "checkpointType": "assessment|observation|meeting",
    "dueWeek": 2,
    "successCriteria": "string<=512"
  }
  ```
- **Валидация:** `dueWeek` ≤ `phase.durationWeeks`.
- **Ответ 201:** `{ "milestoneId": "uuid", "createdAt": "..." }`

### POST `/routes/v1/:routeId/phases/:phaseId/milestones/:milestoneId/complete`
- **Запрос:** `{ "evidenceLinks": ["url1", "url2"], "notes": "string<=512" }`
- **Ответ 200:** `{ "completedAt": "...", "specialistId": "uuid" }`
- **Событие:** `routes.milestone.completed`.

---

## 7. Exercises Service

### POST `/exercises/v1`
- **Роль:** `specialist | admin`.
- **Запрос:** структура из `exercises` (см. модель). Необходимые поля: `title`, `category`, `ageMin`, `ageMax`, `difficulty`, `instructions`.
- **Валидация:** `ageMin <= ageMax`, `materials` массив строк (≤ 32 эл.), `durationMinutes` > 0.
- **Ответ 201:** `{ "id": "uuid", "slug": "string" }`

### GET `/exercises/v1/:id`
- **Ответ 200:** упражнение + метаданные (популярность, последние обновления).

### GET `/exercises/v1`
- **Фильтры:** `category`, `ageFrom`, `ageTo`, `difficulty`, `search`.
- **Ответ:** пагинированный список, `meta.total`.

### PATCH `/exercises/v1/:id`
- **Запрос:** JSON Patch.
- **Правила:** если `difficulty` или `instructions` меняются, создается запись в `exercise_versions`.

### DELETE `/exercises/v1/:id`
- **Ответ:** 202 (retire). Триггерит `exercises.exercise.retired`.

---

## 7.1. Route Templates Service

### POST `/templates/v1`
- **Роль:** `specialist | admin`.
- **Запрос:**
  ```json
  {
    "title": "string<=128",
    "description": "string<=1024",
    "targetAgeRange": "string<=50",
    "severityLevel": "string<=50",
    "phases": [
      {
        "name": "string<=64",
        "description": "string<=512",
        "orderIndex": 1,
        "durationWeeks": 4,
        "specialtyHint": "string<=100",
        "goals": [
          {
            "category": "speech|motor|social|cognitive|sensory|daily",
            "goalType": "skill|behaviour|academic|other",
            "description": "string<=512",
            "targetMetric": "string<=128",
            "measurementUnit": "string<=50",
            "baselineGuideline": "string<=512",
            "targetGuideline": "string<=512",
            "priority": "high|medium|low"
          }
        ],
        "exercises": [
          {
            "exerciseId": "uuid",
            "orderIndex": 1,
            "frequencyPerWeek": 3,
            "durationMinutes": 30,
            "notes": "string<=512"
          }
        ]
      }
    ]
  }
  ```
- **Валидация:** минимум одна фаза, каждая фаза должна содержать хотя бы одну цель.
- **Ответ 201:** `{ "templateId": "uuid", "version": 1, "status": "draft" }`

### GET `/templates/v1`
- **Фильтры:** `status`, `targetAgeRange`, `severityLevel`, `search`.
- **Ответ:** пагинированный список шаблонов.

### GET `/templates/v1/:id`
- **Ответ 200:** шаблон + фазы + цели + упражнения.

### PATCH `/templates/v1/:id`
- **Роль:** `specialist | admin`.
- **Запрос:** частичное обновление шаблона.
- **Правила:** изменения создают новую версию, старая версия архивируется.

### POST `/templates/v1/:id/publish`
- **Роль:** `specialist | admin`.
- **Запрос:** `{ "version": 2, "notes": "string<=512" }`
- **Валидация:** только одна версия может быть в статусе `published`.
- **Ответ 200:** `{ "status": "published", "publishedAt": "...", "version": 2 }`
- **Событие:** `templates.template.published`.

### POST `/templates/v1/:id/archive`
- **Роль:** `admin`.
- **Запрос:** `{ "reason": "string<=512" }`
- **Ответ 200:** `{ "status": "archived", "archivedAt": "..." }`
- **Событие:** `templates.template.archived`.

### POST `/templates/v1/:id/apply-to-route`
- **Роль:** `specialist`.
- **Запрос:**
  ```json
  {
    "childId": "uuid",
    "leadSpecialistId": "uuid",
    "customizations": {
      "title": "string<=128",
      "summary": "string<=1024",
      "planHorizonWeeks": 12
    }
  }
  ```
- **Ответ 201:** `{ "routeId": "uuid", "appliedAt": "...", "templateVersion": 2 }`
- **Событие:** `routes.template.applied`.

---

## 8. Assignments Service

### POST `/assignments/v1`
- **Роль:** `specialist`.
- **Запрос:**
  ```json
  {
    "childId": "uuid",
    "exerciseId": "uuid",
    "routeId": "uuid",
    "phaseId": "uuid?",
    "dueDate": "YYYY-MM-DD",
    "notes": "string<=512",
    "frequencyPerWeek": 3,
    "expectedDurationMinutes": 30
  }
  ```
- **Валидация:** `dueDate` ≥ сегодня, проверка принадлежности ребенка маршруту/фазе, нет активного дублирующего назначения.
- **Ответ 201:** `{ "assignmentId": "uuid", "status": "assigned" }`

### GET `/assignments/v1/:id`
- **Ответ:** 200 → полная карточка.

### PATCH `/assignments/v1/:id`
- **Описание:** обновление сроков, заметок, специалистов.
- **Правила:** нельзя менять `childId`, `routeId`. Смена `dueDate` требует указания `reason`.

### POST `/assignments/v1/:id/status`
- **Запрос:** `{ "status": "in_progress|completed|cancelled", "reason": "…" }`
- **Ответ 200:** новый статус. `completed` автоматически завершает связанные отчеты.

### GET `/assignments/v1/children/:childId`
- **Фильтры:** `status`, `routeId`, `phaseId`, `from`, `to`.
- **Ответ:** список с пагинацией.

---

## 9. Reports Service

### POST `/reports/v1`
- **Роль:** `parent`.
- **Запрос:**
  ```json
  {
    "assignmentId": "uuid",
    "durationMinutes": 25,
    "status": "completed|partial|failed",
    "childMood": "good|neutral|difficult",
    "feedbackText": "string<=1024",
    "media": [
      {
        "mediaId": "uuid",
        "type": "photo|video|audio",
        "url": "https://...",
        "durationSeconds": 30
      }
    ]
  }
  ```
- **Валидация:** родитель привязан к ребенку; не больше одного отчета в день; `mediaId` выдается через отдельный upload flow.
- **Ответ 201:** `{ "reportId": "uuid", "submittedAt": "..." }`
- **События:** `reports.report.submitted`, `reports.media.attached`.

### GET `/reports/v1/:id`
- **Роль:** родители этого ребенка, специалисты, супервизоры.
- **Ответ 200:** данные отчета + история ревью.

### POST `/reports/v1/:id/review`
- **Роль:** `specialist | supervisor`.
- **Запрос:** `{ "reviewStatus": "approved|needs_attention|rejected", "notes": "string<=512" }`
- **Ответ 200:** `{ "reviewedAt": "...", "reviewerId": "uuid" }`
- **Событие:** `reports.report.reviewed`.

### GET `/reports/v1/assignments/:assignmentId`
- **Ответ:** массив отчетов с пагинацией.

---

## 10. Communications Service

### POST `/comms/v1/notifications`
- **Роль:** системные сервисы (используем service token).
- **Запрос:** `{ "recipientId": "uuid", "channel": "email|sms|push|telegram", "template": "assignment_new", "data": { ... }, "scheduledAt": "..." }`
- **Ответ 202:** `{ "notificationId": "uuid" }` (обработка асинхронная).
- **Ошибки:** 400 (валидация), 429 (лимит на пользователя), 503 (провайдер недоступен).

### GET `/comms/v1/notifications/:id`
- **Роль:** владелец + `admin`.
- **Ответ:** статус доставки, логи попыток.

---

## 11. Analytics Service

### GET `/analytics/v1/dashboard/parent`
- **Роль:** `parent`.
- **Ответ:** свод по назначенным упражнениям, тренды, выполненные цели.

### GET `/analytics/v1/dashboard/specialist`
- **Роль:** `specialist`.
- **Фильтры:** `childId`, `dateFrom`, `dateTo`.
- **Ответ:** метрики (графики), ожидаемые отчеты.

### POST `/analytics/v1/snapshots`
- **Роль:** `specialist | supervisor`.
- **Запрос:** `{ "childId": "uuid", "periodStart": "YYYY-MM-DD", "periodEnd": "YYYY-MM-DD" }`
- **Ответ 202:** `{ "snapshotId": "uuid" }`
- **Событие:** `analytics.dashboard.snapshot_generated`.

---

---

## 12. Media & Storage Service

### POST `/media/v1/upload/presigned`
- **Роль:** `parent | specialist`.
- **Описание:** Получение presigned URL для загрузки медиафайлов в MinIO/S3.
- **Запрос:**
  ```json
  {
    "fileName": "video_session.mp4",
    "contentType": "video/mp4",
    "fileSize": 15728640,
    "ownerType": "report",
    "ownerId": "uuid",
    "expiresIn": 3600
  }
  ```
- **Валидация:**
  - `fileSize` ≤ 100MB для видео, ≤ 10MB для фото
  - `contentType`: `image/*`, `video/*`, `audio/*`
  - `ownerType`: `report | diagnostic_session | child_profile`
- **Ответ 201:**
  ```json
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
- **Примечания:** После успешной загрузки клиент вызывает `POST /media/v1/:id/confirm`.

### POST `/media/v1/:id/confirm`
- **Описание:** Подтверждение успешной загрузки файла.
- **Запрос:** `{ "checksum": "sha256-hash" }`
- **Ответ 200:** `{ "status": "confirmed", "url": "https://cdn.neiro.dev/..." }`
- **Событие:** `media.upload.confirmed`.

### GET `/media/v1/:id`
- **Роль:** владелец + команда ребенка + `admin`.
- **Ответ 200:** метаданные файла + presigned URL для скачивания (TTL 15 мин).

### DELETE `/media/v1/:id`
- **Роль:** владелец файла или `admin`.
- **Ответ:** 202 (асинхронное удаление).
- **Примечания:** Soft delete, физическое удаление через 30 дней.

---

## 13. Webhook System

### POST `/webhooks/v1/endpoints`
- **Роль:** `admin`.
- **Описание:** Создание webhook эндпоинта.
- **Запрос:**
  ```json
  {
    "url": "https://partner.example.com/webhook",
    "events": ["routes.route.created", "reports.report.submitted"],
    "secret": "webhook-secret-key",
    "active": true,
    "retryPolicy": {
      "maxAttempts": 5,
      "backoffMultiplier": 2,
      "initialDelay": 1000
    }
  }
  ```
- **Ответ 201:** `{ "webhookId": "uuid", "createdAt": "..." }`

### GET `/webhooks/v1/endpoints`
- **Роль:** `admin`.
- **Описание:** Список webhook эндпоинтов.
- **Ответ 200:** массив webhook эндпоинтов с метаданными.

### GET `/webhooks/v1/endpoints/:id`
- **Роль:** `admin`.
- **Описание:** Детали webhook эндпоинта.
- **Ответ 200:** полная информация о webhook + статистика доставки.

### PATCH `/webhooks/v1/endpoints/:id`
- **Роль:** `admin`.
- **Описание:** Обновление webhook эндпоинта.
- **Запрос:** частичное обновление (JSON Patch).

### DELETE `/webhooks/v1/endpoints/:id`
- **Роль:** `admin`.
- **Описание:** Удаление webhook эндпоинта.
- **Ответ:** 204 No Content.

### GET `/webhooks/v1/events`
- **Роль:** `admin`.
- **Описание:** Список доступных событий для webhook'ов.
- **Ответ 200:**
  ```json
  {
    "events": [
      {
        "name": "routes.route.created",
        "description": "Маршрут создан",
        "version": "1.0",
        "schema": {...}
      }
    ]
  }
  ```

### GET `/webhooks/v1/deliveries`
- **Роль:** `admin`.
- **Описание:** История доставки webhook'ов.
- **Фильтры:** `webhookId`, `status`, `eventName`, `dateFrom`, `dateTo`.
- **Ответ 200:** пагинированный список доставок с деталями.

### POST `/webhooks/v1/deliveries/:id/retry`
- **Роль:** `admin`.
- **Описание:** Повторная отправка webhook'а.
- **Ответ 200:** `{ "retryId": "uuid", "scheduledAt": "..." }`

## 14. Security & Compliance API

> Обязательный сервис MVP: обеспечивает соответствие GDPR, 152-ФЗ и HIPAA (см. SoT §7, `DATA_GOVERNANCE.md`).

### GET `/security/v1/audit/logs`
- **Роль:** `admin | supervisor`.
- **Описание:** Получение логов аудита.
- **Фильтры:** `userId`, `action`, `resource`, `dateFrom`, `dateTo`, `severity`.
- **Ответ 200:**
  ```json
  {
    "logs": [
      {
        "id": "uuid",
        "timestamp": "2025-01-11T10:00:00Z",
        "userId": "uuid",
        "action": "read",
        "resource": "child",
        "resourceId": "uuid",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "severity": "info",
        "details": {...}
      }
    ],
    "total": 150,
    "hasMore": true
  }
  ```

### POST `/security/v1/audit/export`
- **Роль:** `admin`.
- **Описание:** Экспорт логов аудита для соответствия требованиям.
- **Запрос:**
  ```json
  {
    "format": "json|csv|pdf",
    "dateFrom": "2025-01-01T00:00:00Z",
    "dateTo": "2025-01-31T23:59:59Z",
    "filters": {
      "actions": ["read", "write", "delete"],
      "resources": ["child", "route", "report"]
    }
  }
  ```
- **Ответ 202:** `{ "exportId": "uuid", "estimatedSize": "2.5MB" }`

### GET `/security/v1/audit/exports/:id`
- **Роль:** `admin`.
- **Описание:** Статус экспорта аудита.
- **Ответ 200:** `{ "status": "completed", "downloadUrl": "https://...", "expiresAt": "..." }`

### GET `/security/v1/data-subjects`
- **Роль:** `admin`.
- **Описание:** Список субъектов данных (GDPR Article 15).
- **Фильтры:** `type` (child|parent|specialist), `status`.
- **Ответ 200:** список субъектов данных с метаданными.

### GET `/security/v1/data-subjects/:id`
- **Роль:** `admin`.
- **Описание:** Детали субъекта данных.
- **Ответ 200:** полная информация о субъекте данных + связанные данные.

### POST `/security/v1/data-subjects/:id/export`
- **Роль:** `admin`.
- **Описание:** Экспорт данных субъекта (GDPR Article 20).
- **Запрос:** `{ "format": "json|xml", "includeMedia": true }`
- **Ответ 202:** `{ "exportId": "uuid", "estimatedSize": "1.2MB" }`

### DELETE `/security/v1/data-subjects/:id`
- **Роль:** `admin`.
- **Описание:** Удаление данных субъекта (GDPR Article 17).
- **Запрос:** `{ "reason": "withdrawal_of_consent", "confirmDeletion": true }`
- **Ответ 202:** `{ "deletionId": "uuid", "estimatedCompletion": "2025-01-12T10:00:00Z" }`

### GET `/security/v1/retention/policies`
- **Роль:** `admin`.
- **Описание:** Политики хранения данных.
- **Ответ 200:**
  ```json
  {
    "policies": [
      {
        "dataType": "child",
        "retentionPeriod": "5 years",
        "retentionRule": "until_archived_plus_5_years",
        "autoDelete": true,
        "lastApplied": "2025-01-11T10:00:00Z"
      }
    ]
  }
  ```

### POST `/security/v1/retention/apply`
- **Роль:** `admin`.
- **Описание:** Применение политик хранения данных.
- **Запрос:** `{ "dataType": "reports", "dryRun": false }`
- **Ответ 202:** `{ "taskId": "uuid", "affectedRecords": 150 }`

### GET `/security/v1/incidents`
- **Роль:** `admin`.
- **Описание:** Список инцидентов безопасности.
- **Фильтры:** `severity`, `status`, `dateFrom`, `dateTo`.
- **Ответ 200:** список инцидентов с деталями.

### POST `/security/v1/incidents`
- **Роль:** `admin`.
- **Описание:** Создание инцидента безопасности.
- **Запрос:**
  ```json
  {
    "type": "data_breach|unauthorized_access|system_compromise",
    "severity": "low|medium|high|critical",
    "description": "Описание инцидента",
    "affectedUsers": ["uuid1", "uuid2"],
    "detectedAt": "2025-01-11T10:00:00Z"
  }
  ```
- **Ответ 201:** `{ "incidentId": "uuid", "createdAt": "..." }`

---

## 15. PWA Service

> Обеспечивает PWA и офлайн-функциональность, обязательную для MVP (см. SoT §5.4).

### GET `/pwa/v1/manifest`
- **Описание:** Получение манифеста PWA приложения.
- **Ответ 200:**
  ```json
  {
    "name": "Neiro Platform",
    "short_name": "Neiro",
    "description": "Система нейропсихологического сопровождения детей с РАС",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#3b82f6",
    "icons": [
      { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
    ],
    "categories": ["medical", "education", "productivity"],
    "lang": "ru",
    "dir": "ltr"
  }
  ```

### GET `/pwa/v1/service-worker`
- **Описание:** Получение Service Worker для офлайн-режима.
- **Ответ 200:** JavaScript код с политикой кеширования.

### POST `/pwa/v1/cache/update`
- **Роль:** `parent | specialist`.
- **Описание:** Обновление кешированных ресурсов.
- **Запрос:**
  ```json
  {
    "version": "1.2.3",
    "resources": ["/exercises", "/assignments", "/reports"]
  }
  ```
- **Ответ 200:** `{ "cachedAt": "2025-01-11T10:00:00Z", "version": "1.2.3" }`

### GET `/pwa/v1/offline/data`
- **Роль:** `parent | specialist`.
- **Описание:** Получение данных для офлайн работы.
- **Фильтры:** `childId`, `dataType` (`exercises|assignments|reports`).
- **Ответ 200:**
  ```json
  {
    "data": [ /* сокращённый набор данных */ ],
    "lastUpdated": "2025-01-11T10:00:00Z",
    "expiresAt": "2025-01-12T10:00:00Z"
  }
  ```

### POST `/pwa/v1/push/subscribe`
- **Роль:** `parent | specialist`.
- **Описание:** Подписка на push-уведомления.
- **Запрос:**
  ```json
  {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": { "p256dh": "string", "auth": "string" },
    "preferences": {
      "assignmentReminders": true,
      "reportDeadlines": true,
      "consultationReminders": false
    }
  }
  ```
- **Ответ 201:** `{ "subscriptionId": "uuid", "subscribedAt": "..." }`

---

## 16. Enhanced Analytics Service

> Расширяет аналитику для супервизоров и администраторов (SoT §3 и §11). Сервисы опираются на агрегаты `analytics` и события из `DATA_MODEL_AND_EVENTS.md`.

### GET `/analytics/v1/risk-dashboard`
- **Роль:** `supervisor | admin`.
- **Описание:** Дашборд рисков и отклонений по маршрутам и специалистам.
- **Фильтры:** `specialistId`, `dateFrom`, `dateTo`, `riskLevel`.
- **Ответ 200:**
  ```json
  {
    "generatedAt": "2025-01-11T10:05:00Z",
    "riskMetrics": {
      "overdueAssignments": 5,
      "missedMilestones": 2,
      "lowEngagement": 3
    },
    "alerts": [
      {
        "id": "uuid",
        "type": "overdue_assignment",
        "severity": "high",
        "childId": "uuid",
        "specialistId": "uuid",
        "createdAt": "2025-01-11T10:00:00Z"
      }
    ]
  }
  ```

### GET `/analytics/v1/milestone-tracking`
- **Роль:** `specialist | supervisor`.
- **Описание:** Отслеживание статуса контрольных точек маршрутов.
- **Фильтры:** `routeId`, `phaseId`, `status`, `specialistId`.
- **Ответ 200:**
  ```json
  {
    "milestones": [
      {
        "id": "uuid",
        "title": "Оценка речи",
        "dueDate": "2025-01-15",
        "status": "overdue",
        "childId": "uuid",
        "specialistId": "uuid",
        "daysOverdue": 3
      }
    ],
    "summary": {
      "total": 15,
      "completed": 10,
      "overdue": 3,
      "upcoming": 2
    }
  }
  ```

### GET `/analytics/v1/specialist-performance`
- **Роль:** `supervisor | admin`.
- **Описание:** Производственные показатели специалистов.
- **Фильтры:** `specialistId`, `period`, `metric`.
- **Ответ 200:**
  ```json
  {
    "specialistId": "uuid",
    "period": "2025-01",
    "metrics": {
      "assignmentsCompleted": 45,
      "averageReportTime": 2.5,
      "clientSatisfaction": 4.8,
      "milestoneCompletionRate": 0.92
    },
    "trends": {
      "assignmentsCompleted": "+12%",
      "averageReportTime": "-0.5h"
    }
  }
  ```

---

## 17. Интеграции и расширения (Roadmap)

> Эти сервисы отнесены к roadmap. Они требуют дополнительных интеграций, юридических согласований или внедрения инфраструктуры за пределами MVP. Включение в разработку планируется после стабилизации базового функционала. Критерии отбора: (1) внешняя зависимость ещё не согласована, (2) отсутствует критичность для MVP user journey, (3) требуется дополнительная безопасность/юридическая экспертиза.

### 17.1 Telegram Bot Integration

#### POST `/telegram/v1/webapp/auth`
- **Описание:** Аутентификация пользователя через Telegram WebApp.
- **Ответ 200:** JWT-пара, привязка `telegramId`.

#### GET `/telegram/v1/webapp/assignments`
- **Роль:** `parent`.
- **Описание:** Упрощенный список назначений с быстрыми действиями.

#### POST `/telegram/v1/webapp/quick-report`
- **Роль:** `parent`.
- **Описание:** Быстрая сдача отчета (статус, настроение ребенка, медиа).

#### POST `/telegram/v1/webapp/notifications/settings`
- **Роль:** `parent`.
- **Описание:** Настройка уведомлений и «тихих часов» в Telegram.

### 17.2 WebRTC Video Service

- Поддерживает создание видеосессий `/webrtc/v1/sessions`, получение токена, запуск записи и выдачу записи. Роли: `specialist | parent`.

### 17.3 Gamification Service

- Эндпоинты `/gamification/v1/achievements`, `/gamification/v1/rewards`, `/gamification/v1/progress` предоставляют механику наград для повышения вовлеченности.

### 17.4 Offline Sync Service

- Эндпоинты `/sync/v1/offline-data`, `/sync/v1/conflicts`, `/sync/v1/resolve-conflicts` обеспечивают офлайн-сбор данных и разрешение конфликтов синхронизации.

---

## 18. tRPC Namespace

Для клиентов (Next.js BFF) используется tRPC с namespace `appRouter`.

### 18.1 Структура роутеров

```typescript
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  children: childrenRouter,
  diagnostics: diagnosticsRouter,
  routes: routesRouter,
  exercises: exercisesRouter,
  assignments: assignmentsRouter,
  reports: reportsRouter,
  media: mediaRouter,
  analytics: analyticsRouter,
  comms: commsRouter,
  pwa: pwaRouter,
  webhooks: webhooksRouter,
  security: securityRouter,
  // Roadmap-роутеры подключаются по мере реализации интеграций
  // telegram: telegramRouter,
  // webrtc: webrtcRouter,
  // gamification: gamificationRouter,
  // sync: syncRouter,
});

export type AppRouter = typeof appRouter;
```

### 18.2 Примеры процедур

#### Auth Router
```typescript
authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input }) => { /* ... */ }),

  refresh: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => { /* ... */ }),

  logout: protectedProcedure
    .mutation(async ({ ctx }) => { /* ... */ }),

  getSession: protectedProcedure
    .query(async ({ ctx }) => { /* ... */ }),
});
```

#### Children Router
```typescript
childrenRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => { /* ... */ }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => { /* ... */ }),

  create: protectedProcedure
    .meta({ roles: ['specialist', 'admin'] })
    .input(CreateChildSchema)
    .mutation(async ({ input, ctx }) => { /* ... */ }),

  update: protectedProcedure
    .meta({ roles: ['specialist', 'admin'] })
    .input(UpdateChildSchema)
    .mutation(async ({ input, ctx }) => { /* ... */ }),

  archive: protectedProcedure
    .meta({ roles: ['admin'] })
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => { /* ... */ }),
});
```

#### Routes Router
```typescript
routesRouter = router({
  create: protectedProcedure
    .meta({ roles: ['specialist'] })
    .input(CreateRouteSchema)
    .mutation(async ({ input, ctx }) => { /* ... */ }),

  activate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => { /* ... */ }),

  complete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      outcomeSummary: z.string().max(2048),
    }))
    .mutation(async ({ input, ctx }) => { /* ... */ }),

  listByChild: protectedProcedure
    .input(z.object({
      childId: z.string().uuid(),
      status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).optional(),
    }))
    .query(async ({ input, ctx }) => { /* ... */ }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => { /* ... */ }),
});
```

### 18.3 Middleware для ролей

```typescript
const enforceRoles = (allowedRoles: Role[]) => {
  return t.middleware(({ ctx, next, meta }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const procedureRoles = meta?.roles as Role[] | undefined;
    if (procedureRoles && !procedureRoles.includes(ctx.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({ ctx });
  });
};
```

### 18.4 Type Safety

Все типы генерируются из Zod схем:

```typescript
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

// Использование в клиенте
type ChildListInput = RouterInput['children']['list'];
type ChildListOutput = RouterOutput['children']['list'];
```

---

## 19. Общие схемы данных

### 19.1 User (Пользователь)

```typescript
interface User {
  id: string; // UUID v7
  email: string;
  role: 'parent' | 'specialist' | 'supervisor' | 'admin';
  status: 'active' | 'suspended' | 'invited';
  firstName: string;
  lastName: string;
  phone?: string; // E.164
  timezone: string; // IANA, например 'Asia/Tashkent'
  avatar?: string; // URL
  externalId?: string; // Внешний идентификатор
  createdAt: string; // ISO 8601
  updatedAt: string;
}
```

### 19.1.1 Specialist (Профиль специалиста)

```typescript
interface Specialist {
  id: string; // UUID v7, совпадает с users.id
  userId: string; // Ссылка на users.id
  specialty: 'neuropsychologist' | 'speech_therapist' | 'aba' | 'occupational' | 'supervisor' | 'other';
  licenseNumber?: string;
  licenseValidUntil?: string; // YYYY-MM-DD
  experienceYears?: number;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 19.2 Child (Ребенок)

```typescript
interface Child {
  id: string; // UUID v7
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other';
  diagnosisSummary?: string;
  notes?: string;
  archivedAt?: string; // ISO 8601, soft delete
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601

  // Связи
  parents: Array<{
    id: string; // UUID связи
    userId: string;
    relationship: 'mother' | 'father' | 'guardian' | 'other';
    legalGuardian: boolean;
    guardianshipType?: string;
    invitedAt?: string;
    linkedAt: string;
  }>;

  specialists: Array<{
    id: string; // UUID связи
    specialistId: string; // Ссылка на specialists.id
    specialization: 'lead' | 'speech' | 'aba' | 'occupational' | 'supervisor' | 'other';
    isPrimary: boolean;
    assignedAt: string;
    releasedAt?: string;
    roleDescription?: string;
  }>;

  activeRoute?: {
    id: string;
    title: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    progress: number; // 0-100
    startDate?: string;
    endDate?: string;
  };
}
```

### 19.3 Diagnostic Session (Сеанс диагностики)

```typescript
interface DiagnosticSession {
  id: string;
  childId: string;
  questionnaireCode: string; // 'MCHAT_R_F', 'ADOS_2', etc.
  performedBy: string; // userId
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  startedAt: string;
  completedAt?: string;

  // Результаты (только при completed)
  scoreTotal?: number;
  scoreRaw?: number;
  interpretationLevel?: 'low' | 'medium' | 'high';

  metadata: {
    context: 'in_clinic' | 'remote';
    notes?: string;
  };
}
```

### 19.4 Correction Route (Коррекционный маршрут)

```typescript
interface CorrectionRoute {
  id: string; // UUID v7
  childId: string;
  leadSpecialistId: string; // Ссылка на specialists.id
  templateId?: string; // Ссылка на route_templates.id
  activeVersionId?: string; // Ссылка на route_revision_history.id
  baselineSnapshotId?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  title: string;
  summary: string;
  planHorizonWeeks?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601

  goals: Array<{
    id: string;
    phaseId?: string; // Если NULL - цель относится ко всему маршруту
    category: 'speech' | 'motor' | 'social' | 'cognitive' | 'sensory' | 'daily';
    goalType: 'skill' | 'behaviour' | 'academic' | 'other';
    description: string;
    targetMetric: string;
    measurementUnit?: string;
    baselineValue?: string;
    targetValue?: string;
    reviewPeriodWeeks?: number;
    priority: 'high' | 'medium' | 'low';
    status: 'not_started' | 'in_progress' | 'achieved' | 'modified';
    createdAt: string;
    updatedAt: string;
  }>;

  phases: Array<{
    id: string;
    name: string;
    description?: string;
    orderIndex: number;
    parallelGroup?: number;
    status: 'planned' | 'active' | 'on_hold' | 'completed';
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    durationWeeks?: number;
    expectedOutcomes?: string;
    notes?: string;
    responsibleSpecialistId: string; // Ссылка на specialists.id
    milestones: Array<{
      id: string;
      title: string;
      description?: string;
      checkpointType: 'assessment' | 'observation' | 'meeting';
      dueWeek: number;
      successCriteria?: string;
      status: 'planned' | 'due' | 'completed' | 'overdue';
      completedAt?: string;
      evidenceLinks?: string[];
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### 19.5 Exercise (Упражнение)

```typescript
interface Exercise {
  id: string;
  slug: string;
  title: string;
  category: 'cognitive' | 'speech' | 'motor' | 'social' | 'sensory' | 'daily';
  ageMin: number; // годы
  ageMax: number;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMinutes: number;

  description: string;
  materials: string[]; // ['Мяч', 'Карточки с цветами']
  instructions: {
    steps: Array<{
      order: number;
      text: string;
      mediaUrl?: string;
    }>;
    tips?: string[];
    safetyNotes?: string[];
  };

  successCriteria: string[];
  mediaAssets: Array<{
    type: 'video' | 'image';
    url: string;
    description?: string;
  }>;

  published: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 19.6 Assignment (Назначение)

```typescript
interface Assignment {
  id: string;
  childId: string;
  exerciseId: string;
  routeId: string;
  phaseId?: string;
  specialistId: string; // кто назначил

  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  assignedAt: string;
  dueDate: string; // YYYY-MM-DD
  completedAt?: string;

  frequencyPerWeek: number; // 1-7
  expectedDurationMinutes: number;
  notes?: string;

  // Вычисляемые поля
  reportsCount: number;
  lastReportDate?: string;
}
```

### 19.7 Report (Отчет родителя)

```typescript
interface Report {
  id: string;
  assignmentId: string;
  parentId: string;
  reportDate: string; // YYYY-MM-DD

  durationMinutes: number;
  status: 'completed' | 'partial' | 'failed';
  childMood: 'good' | 'neutral' | 'difficult';
  feedbackText?: string;

  media: Array<{
    mediaId: string;
    type: 'photo' | 'video' | 'audio';
    url: string;
    durationSeconds?: number;
  }>;

  submittedAt: string;

  // Ревью
  reviewedBy?: string; // userId
  reviewedAt?: string;
  reviewStatus?: 'approved' | 'needs_attention' | 'rejected';
  reviewNotes?: string;
  autoScore?: number; // 0-100
}
```

### 19.8 Route Template (Шаблон маршрута)

```typescript
interface RouteTemplate {
  id: string; // UUID v7
  title: string;
  description?: string;
  targetAgeRange?: string;
  severityLevel?: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  publishedAt?: string; // ISO 8601

  phases: Array<{
    id: string;
    name: string;
    description?: string;
    orderIndex: number;
    durationWeeks?: number;
    specialtyHint?: string;
    notes?: string;
    goals: Array<{
      id: string;
      category: 'speech' | 'motor' | 'social' | 'cognitive' | 'sensory' | 'daily';
      goalType: 'skill' | 'behaviour' | 'academic' | 'other';
      description: string;
      targetMetric?: string;
      measurementUnit?: string;
      baselineGuideline?: string;
      targetGuideline?: string;
      priority: 'high' | 'medium' | 'low';
      notes?: string;
    }>;
    exercises: Array<{
      id: string;
      exerciseId: string;
      orderIndex: number;
      frequencyPerWeek: number;
      durationMinutes: number;
      notes?: string;
    }>;
  }>;
}
```

### 19.9 Notification (Уведомление)

```typescript
interface Notification {
  id: string; // UUID v7
  recipientId: string;
  channel: 'email' | 'sms' | 'push' | 'telegram';
  template: string; // 'assignment_new', 'report_reviewed', etc.
  payload: Record<string, any>; // Переменные для шаблона
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  attempts: number;
  scheduledAt: string; // ISO 8601
  sentAt?: string; // ISO 8601
  lastError?: string;
  createdAt: string; // ISO 8601
}
```

### 19.10 Telegram User (Telegram пользователь)

```typescript
interface TelegramUser {
  id: string; // UUID v7
  userId: string; // Ссылка на users.id
  telegramId: number; // Telegram user ID
  username?: string;
  firstName: string;
  lastName?: string;
  isActive: boolean;
  lastSeenAt: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 19.11 Video Session (Видеосессия)

```typescript
interface VideoSession {
  id: string; // UUID v7
  sessionType: 'consultation' | 'diagnostic' | 'supervision';
  participants: string[]; // user IDs
  childId?: string;
  roomToken: string;
  roomUrl: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt: string; // ISO 8601
  startedAt?: string; // ISO 8601
  endedAt?: string; // ISO 8601
  duration: number; // minutes
  recordingEnabled: boolean;
  recordingId?: string;
  createdBy: string; // user ID
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 19.12 Achievement (Достижение)

```typescript
interface Achievement {
  id: string; // UUID v7
  childId: string;
  title: string;
  description: string;
  icon: string; // emoji
  category: 'consistency' | 'progress' | 'milestone' | 'special';
  points: number;
  status: 'locked' | 'unlocked' | 'claimed';
  unlockedAt?: string; // ISO 8601
  claimedAt?: string; // ISO 8601
  requirements: {
    type: 'streak_days' | 'total_points' | 'completed_assignments' | 'custom';
    value: number;
    description: string;
  };
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 19.13 Offline Data (Офлайн данные)

```typescript
interface OfflineData {
  id: string; // UUID v7
  deviceId: string;
  userId: string;
  dataType: 'report' | 'assignment' | 'media' | 'milestone';
  dataId: string; // ID записи
  data: Record<string, any>; // JSON данные
  status: 'pending' | 'synced' | 'conflict' | 'error';
  lastSyncAt?: string; // ISO 8601
  conflicts?: Array<{
    field: string;
    localValue: any;
    serverValue: any;
    resolution?: 'keep_local' | 'keep_server' | 'merge';
  }>;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 19.14 Risk Alert (Предупреждение о риске)

```typescript
interface RiskAlert {
  id: string; // UUID v7
  type: 'overdue_assignment' | 'missed_milestone' | 'low_engagement' | 'data_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  childId?: string;
  specialistId?: string;
  routeId?: string;
  assignmentId?: string;
  description: string;
  details: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedBy?: string; // user ID
  acknowledgedAt?: string; // ISO 8601
  resolvedAt?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 19.15 PWA Manifest (PWA манифест)

```typescript
interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: 'any' | 'maskable' | 'monochrome';
  }>;
  categories: string[];
  lang: string;
  dir: 'ltr' | 'rtl';
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';
  scope?: string;
  id?: string;
}
```

### 19.16 Webhook Endpoint (Webhook эндпоинт)

```typescript
interface WebhookEndpoint {
  id: string; // UUID v7
  url: string;
  events: string[]; // Список событий для подписки
  secret: string; // HMAC ключ для подписи
  active: boolean;
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number; // ms
  };
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastDeliveryAt?: string; // ISO 8601
  failureCount: number;
}
```

### 19.17 Webhook Delivery (Webhook доставка)

```typescript
interface WebhookDelivery {
  id: string; // UUID v7
  webhookId: string;
  eventName: string;
  eventId: string;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string; // ISO 8601
  deliveredAt?: string; // ISO 8601
  failedAt?: string; // ISO 8601
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 19.18 Audit Log (Лог аудита)

```typescript
interface AuditLog {
  id: string; // UUID v7
  timestamp: string; // ISO 8601
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
  resource: string; // 'child', 'route', 'report', etc.
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  details: Record<string, any>;
  sessionId?: string;
  correlationId?: string;
  causationId?: string;
}
```

### 19.19 Data Subject (Субъект данных)

```typescript
interface DataSubject {
  id: string; // UUID v7
  type: 'child' | 'parent' | 'specialist';
  userId?: string; // Если это пользователь
  childId?: string; // Если это ребенок
  status: 'active' | 'archived' | 'deleted';
  personalData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    birthDate?: string; // YYYY-MM-DD
  };
  consentGiven: boolean;
  consentDate?: string; // ISO 8601
  dataRetentionUntil?: string; // ISO 8601
  lastAccessedAt?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 19.20 Security Incident (Инцидент безопасности)

```typescript
interface SecurityIncident {
  id: string; // UUID v7
  type: 'data_breach' | 'unauthorized_access' | 'system_compromise' | 'malware' | 'phishing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  title: string;
  description: string;
  affectedUsers: string[]; // user IDs
  affectedData: string[]; // типы затронутых данных
  detectedAt: string; // ISO 8601
  reportedAt: string; // ISO 8601
  containedAt?: string; // ISO 8601
  resolvedAt?: string; // ISO 8601
  assignedTo?: string; // user ID
  resolution?: string;
  lessonsLearned?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

---

## 20. Следующие шаги

### 20.1 Приоритет 1 (Немедленно)

1. ✅ **OpenAPI 3.1 спецификации** — генерация для каждого сервиса
2. ✅ **Zod/TypeBox схемы** — для tRPC валидации
3. ⏳ **Mock серверы** — Prism для тестирования фронтенда
4. ⏳ **Postman/Insomnia коллекции** — для QA

### 20.2 Приоритет 2 (Ближайшие 2 недели)

5. ✅ **Доменные события** — полное покрытие событий из `DATA_MODEL_AND_EVENTS.md`:
   - **Auth Service:** `auth.user.invited`, `auth.user.activated`, `auth.user.role_changed`, `auth.user.suspended`
   - **Specialists Service:** `specialists.assignment.created`, `specialists.assignment.released`
   - **Diagnostics Service:** `diagnostics.session.started`, `diagnostics.session.completed`, `diagnostics.session.cancelled`, `diagnostics.recommendations.generated`
   - **Route Orchestrator:** `routes.route.created`, `routes.route.activated`, `routes.route.updated`, `routes.route.completed`, `routes.goal.status_changed`, `routes.phase.created`, `routes.phase.status_changed`, `routes.milestone.completed`, `routes.template.applied`
   - **Exercises Service:** `exercises.exercise.published`, `exercises.exercise.updated`, `exercises.exercise.retired`
   - **Assignments Service:** `assignments.assignment.created`, `assignments.assignment.status_changed`, `assignments.assignment.overdue`, `assignments.assignment.cancelled`
   - **Reports Service:** `reports.report.submitted`, `reports.report.reviewed`, `reports.media.attached`
   - **Templates Service:** `templates.template.published`, `templates.template.archived`, `templates.template.updated`, `templates.template.exercise_updated`
   - **Communications Service:** `comms.notification.sent`, `comms.notification.failed`
   - **Analytics Service:** `analytics.dashboard.snapshot_generated`
6. ⏳ **Rate limiting** — настроить лимиты в API Gateway
7. ⏳ **Мониторинг** — логирование запросов, метрики ошибок
8. ⏳ **Тесты контрактов** — Contract testing (Pact/Postman)

### 20.3 Приоритет 3 (Перед production)

9. ⏳ **Версионирование API** — стратегия миграции на v2
10. ⏳ **GDPR compliance** — аудит endpoint'ов на утечки PII
11. ⏳ **GraphQL Gateway** — опционально для сложных запросов
12. ⏳ **Webhooks** — для интеграций с внешними системами

### 20.4 Дополнительные улучшения

- **WebSocket endpoints** для real-time чата и уведомлений
- **Batch API** для массовых операций (например, назначение упражнений сразу группе детей)
- **Архивация данных** — специальные эндпоинты для экспорта по GDPR
- **Аудит логи** — отдельный сервис для соблюдения 152-ФЗ

---

**Changelog v0.5 (11.01.2025):**
- ✨ Добавлен **PWA Service** (5 новых эндпоинтов для PWA функциональности)
- ✨ Добавлен **Webhook System** (8 новых эндпоинтов для event-driven архитектуры)
- ✨ Добавлен **Security & Compliance API** (10 новых эндпоинтов для GDPR/HIPAA соответствия)
- ✨ Добавлены **требования к производительности** (SLO, мониторинг, метрики)
- ✨ Расширены **схемы данных** новыми интерфейсами:
  - PWAManifest для PWA манифеста
  - WebhookEndpoint и WebhookDelivery для webhook системы
  - AuditLog для аудита действий
  - DataSubject для GDPR соответствия
  - SecurityIncident для инцидентов безопасности
- ✨ Обновлен **tRPC Namespace** с новыми роутерами
- 📝 **100% соответствие SOT** - все требования из ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md покрыты API
- 📝 Обновлено **содержание** с новыми разделами
- 📝 Переработана **нумерация разделов** для соответствия структуре
- 🎯 **Полное соответствие DOCUMENTATION_UPDATE_GUIDELINE.md** - документ обновлен согласно регламенту

## 21. Changelog

**Changelog v0.6 (28.10.2025):**
- 🔄 Перевели фронтенд-пресет на Next.js 14+ (App Router) в общих положениях и ссылках на деплой.
- 🗂️ Переструктурировали документ: ключевые сервисы MVP отделены от раздела «Интеграции и расширения (Roadmap)».
- ✅ Вернули Security & Compliance API, PWA Service и Enhanced Analytics в основной перечень MVP-эндпоинтов.
- 🔗 Добавлены ссылки на SoT и `DOCUMENTATION_UPDATE_GUIDELINE.md` для контроля обновлений.
- 🧭 Актуализирован перечень сервисов (Webhook System вынесен в отдельный раздел).

**Changelog v0.5 (11.01.2025):**
- ✨ Дополнены performance-требованиями и мониторингом ответов.
- 🔐 Расширены правила валидации и конституционные чек-листы.

**Changelog v0.4 (11.01.2025):**
- ✨ Добавлен **Telegram Bot Integration Service** (4 новых эндпоинта для Telegram WebApp)
- ✨ Добавлен **WebRTC Video Service** (4 новых эндпоинта для видеоконсультаций)
- ✨ Добавлен **Gamification Service** (3 новых эндпоинта для системы достижений)
- ✨ Добавлен **Offline Sync Service** (3 новых эндпоинта для офлайн синхронизации)
- ✨ Добавлен **Enhanced Analytics Service** (3 новых эндпоинта для расширенной аналитики)
- ✨ Расширены **схемы данных** новыми интерфейсами:
  - TelegramUser для интеграции с Telegram
  - VideoSession для видеоконсультаций
  - Achievement для геймификации
  - OfflineData для офлайн синхронизации
  - RiskAlert для системы предупреждений
- ✨ Обновлен **tRPC Namespace** с новыми роутерами
- 📝 Обновлено **содержание** с новыми разделами
- 📝 Переработана **нумерация разделов** для соответствия структуре
- 🎯 **Полное соответствие CJM требованиям** - все функции из Customer Journey Maps теперь покрыты API

**Changelog v0.3 (28.10.2025):**
- ✨ Добавлен **Specialists Service** (5 новых эндпоинтов для управления специалистами)
- ✨ Добавлены API для **фаз маршрута** (POST/GET/PATCH phases, milestones)
- ✨ Добавлены API для **целей маршрута** (POST/GET/PATCH goals, status changes)
- ✨ Добавлен **Route Templates Service** (создание, публикация, применение шаблонов)
- ✨ Расширены **схемы данных** в соответствии с DATA_MODEL_AND_EVENTS.md:
  - Добавлены поля `createdAt`, `updatedAt`, `externalId` в User
  - Добавлен интерфейс Specialist с полным профилем
  - Обновлен Child с правильными связями через junction таблицы
  - Расширен CorrectionRoute с фазами, целями, контрольными точками
  - Добавлен RouteTemplate с полной структурой
- ✨ Добавлены **Constitution Check правила** валидации из DATA_MODEL_AND_EVENTS.md
- ✨ Полное покрытие **доменных событий** для всех сервисов
- 📝 Обновлен раздел **Следующие шаги** с актуальными приоритетами

**Changelog v0.2 (28.10.2025):**
- ✨ Добавлен раздел **Media & Storage Service** (4 новых эндпоинта)
- ✨ Расширен раздел **tRPC Namespace** с примерами кода и middleware
- ✨ Добавлен раздел **Общие схемы данных** (8 TypeScript интерфейсов)
- 📝 Улучшена документация **Общих положений** (пагинация, rate limiting, валидация)
- 📝 Добавлено содержание для навигации
- 📝 Обновлен раздел **Следующие шаги** с приоритетами

**Документ обновляется по мере расширения MVP и добавления новых модулей.**
