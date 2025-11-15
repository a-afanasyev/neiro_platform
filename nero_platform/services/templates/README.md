# Templates Service

Микросервис управления шаблонами коррекционных маршрутов для Neiro Platform.

## 🎯 Назначение

Templates Service отвечает за:
- Создание, чтение, обновление и архивацию шаблонов маршрутов
- Версионирование шаблонов с сохранением истории изменений
- Публикацию шаблонов для использования специалистами
- Клонирование существующих шаблонов
- Применение шаблонов к конкретным маршрутам детей
- Публикацию доменных событий в Postgres Outbox

## 📋 API Endpoints

### Базовый URL: `/templates/v1`

| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/` | Список шаблонов с фильтрацией | specialist, supervisor, admin |
| GET | `/:id` | Получение шаблона с фазами и целями | specialist, supervisor, admin |
| POST | `/` | Создание нового шаблона | supervisor, admin |
| PATCH | `/:id` | Обновление шаблона | supervisor, admin |
| POST | `/:id/publish` | Публикация шаблона | admin |
| POST | `/:id/archive` | Архивация шаблона | admin |
| POST | `/:id/clone` | Клонирование шаблона | supervisor, admin |
| GET | `/:id/versions` | История версий шаблона | supervisor, admin |

### Health Check

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/health` | Статус сервиса |

## 🔧 Конфигурация

### Environment Variables

```env
# Сервис
TEMPLATES_SERVICE_PORT=4008

# База данных (из @neiro/database)
DATABASE_URL=postgresql://neiro_user:neiro_password_dev@postgres:5432/neiro_platform

# CORS
CORS_ORIGIN=http://localhost:3001

# JWT (для аутентификации)
JWT_ACCESS_SECRET=dev_access_secret_change_in_production_2024
```

## 🚀 Запуск

### Development (внутри Docker)

```bash
# Из корня проекта
docker-compose exec app pnpm --filter @neiro/templates dev
```

### Production Build

```bash
# Build
docker-compose exec app pnpm --filter @neiro/templates build

# Start
docker-compose exec app pnpm --filter @neiro/templates start
```

### Тестирование

```bash
# Unit тесты
docker-compose exec app pnpm --filter @neiro/templates test

# Watch mode
docker-compose exec app pnpm --filter @neiro/templates test:watch

# Coverage
docker-compose exec app pnpm --filter @neiro/templates test:coverage
```

## 📊 Структура данных

### RouteTemplate Model (Prisma)

```typescript
model RouteTemplate {
  id                String   @id @default(uuid())
  name              String
  slug              String   @unique
  description       String?
  version           Int      @default(1)
  isPublished       Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  phases            TemplatePhase[]
  goals             TemplateGoal[]
  milestones        TemplateMilestone[]
  exercises         TemplateExercise[]
}
```

## 📡 События (Postgres Outbox)

Сервис публикует следующие доменные события:

| Событие | Условие | Payload |
|---------|---------|---------|
| `templates.template.published` | Шаблон опубликован | `{template_id, slug, version, published_at}` |
| `templates.template.updated` | Шаблон обновлен | `{template_id, version, updated_fields, updated_at}` |
| `templates.template.archived` | Шаблон архивирован | `{template_id, archived_at, reason}` |
| `templates.template.exercise_updated` | Упражнение в шаблоне обновлено | `{template_id, exercise_id, updated_at}` |

## 🔒 Безопасность

- JWT аутентификация (Bearer token)
- RBAC проверка ролей
- Rate limiting: 100 запросов/минуту
- Helmet для защиты заголовков
- Валидация всех входных данных через Zod
- RFC 7807 формат ошибок

## 🔄 Версионирование

Шаблоны поддерживают версионирование:

- При каждом обновлении опубликованного шаблона создается новая версия
- Сохраняются все предыдущие версии для аудита
- Можно просмотреть историю версий через `GET /templates/v1/:id/versions`
- Клонирование создает копию с версией 1

## 📦 Зависимости

- `@neiro/database` - Prisma клиент и модели
- `@neiro/types` - Общие TypeScript типы
- `@neiro/utils` - Утилиты (JWT, валидация, форматирование)
- `express` - HTTP сервер
- `zod` - Валидация схем

## 🔗 Связанные сервисы

- **Exercises Service** - шаблоны используют упражнения
- **Route Orchestrator Service** - создает маршруты из шаблонов
- **Users Service** - авторизация специалистов

## 📄 Лицензия

Proprietary - Neiro Platform © 2025


