# Exercises Service

Микросервис управления библиотекой упражнений для коррекционных маршрутов Neiro Platform.

## 🎯 Назначение

Exercises Service отвечает за:
- Создание, чтение, обновление и архивацию упражнений
- Загрузку медиа-материалов (видео, аудио, изображения) в MinIO
- Публикацию упражнений для использования в маршрутах
- Фильтрацию упражнений по категориям, возрасту, сложности
- Публикацию доменных событий в Postgres Outbox

## 📋 API Endpoints

### Базовый URL: `/exercises/v1`

| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/` | Список упражнений с фильтрацией | specialist, supervisor, admin |
| GET | `/:id` | Получение упражнения по ID | specialist, supervisor, admin |
| POST | `/` | Создание нового упражнения | specialist, admin |
| PATCH | `/:id` | Обновление упражнения | specialist, admin |
| DELETE | `/:id` | Архивация упражнения (soft delete) | admin |
| POST | `/:id/publish` | Публикация упражнения | admin |
| GET | `/categories` | Список доступных категорий | все |

### Health Check

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/health` | Статус сервиса |

## 🔧 Конфигурация

### Environment Variables

```env
# Сервис
EXERCISES_SERVICE_PORT=4007

# База данных (из @neiro/database)
DATABASE_URL=postgresql://neiro_user:neiro_password_dev@postgres:5432/neiro_platform

# MinIO (S3-compatible storage)
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_USE_SSL=false
MINIO_BUCKET_EXERCISES=exercises

# CORS
CORS_ORIGIN=http://localhost:3001

# JWT (для аутентификации)
JWT_ACCESS_SECRET=dev_access_secret_change_in_production_2024
```

## 🚀 Запуск

### Development (внутри Docker)

```bash
# Из корня проекта
docker-compose exec app pnpm --filter @neiro/exercises dev
```

### Production Build

```bash
# Build
docker-compose exec app pnpm --filter @neiro/exercises build

# Start
docker-compose exec app pnpm --filter @neiro/exercises start
```

### Тестирование

```bash
# Unit тесты
docker-compose exec app pnpm --filter @neiro/exercises test

# Watch mode
docker-compose exec app pnpm --filter @neiro/exercises test:watch

# Coverage
docker-compose exec app pnpm --filter @neiro/exercises test:coverage
```

## 📊 Структура данных

### Exercise Model (Prisma)

```typescript
model Exercise {
  id               String   @id @default(uuid())
  title            String
  slug             String   @unique
  description      String?
  category         String   // cognitive, speech, motor, social, sensory, daily
  ageMin           Int
  ageMax           Int
  difficulty       String   // easy, medium, hard
  durationMinutes  Int
  materials        Json     // JSONB: [{name, quantity, optional}]
  instructions     Json     // JSONB: {steps, duration_per_step, visual_aids}
  successCriteria  Json     // JSONB: [criteria]
  mediaAssets      Json     // JSONB: [{type, url, description}]
  published        Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

## 📡 События (Postgres Outbox)

Сервис публикует следующие доменные события:

| Событие | Условие | Payload |
|---------|---------|---------|
| `exercises.exercise.published` | Упражнение опубликовано | `{exercise_id, slug, category, difficulty, published_at}` |
| `exercises.exercise.updated` | Упражнение обновлено | `{exercise_id, updated_fields, updated_at}` |
| `exercises.exercise.retired` | Упражнение архивировано | `{exercise_id, retired_at, reason}` |

## 🔒 Безопасность

- JWT аутентификация (Bearer token)
- RBAC проверка ролей
- Rate limiting: 100 запросов/минуту
- Helmet для защиты заголовков
- Валидация всех входных данных через Zod
- RFC 7807 формат ошибок

## 📝 Фильтрация упражнений

### Query Parameters

```
GET /exercises/v1?category=speech&difficulty=medium&ageFrom=5&ageTo=10&published=true&limit=20&cursor=...
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `category` | string | Фильтр по категории |
| `difficulty` | string | Фильтр по сложности (easy, medium, hard) |
| `ageFrom` | number | Минимальный возраст |
| `ageTo` | number | Максимальный возраст |
| `published` | boolean | Только опубликованные |
| `search` | string | Поиск по названию/описанию |
| `limit` | number | Количество результатов (по умолчанию 20, max 100) |
| `cursor` | string | Курсор для пагинации |

## 📦 MinIO интеграция

Сервис использует MinIO для хранения медиа-файлов:

- **Bucket**: `exercises`
- **Структура**: `exercises/{exercise_id}/{filename}`
- **Поддерживаемые форматы**: видео (mp4, webm), аудио (mp3, wav), изображения (jpg, png, webp)
- **Максимальный размер файла**: 50 MB

## 🧪 Тестирование

### Unit Tests

- ✅ Controllers тесты
- ✅ Services тесты
- ✅ Validators тесты
- ✅ MinIO client тесты

### Integration Tests

- ✅ CRUD операции через API
- ✅ Фильтрация и пагинация
- ✅ Загрузка медиа в MinIO
- ✅ Публикация событий в Outbox

## 📚 Зависимости

- `@neiro/database` - Prisma клиент и модели
- `@neiro/types` - Общие TypeScript типы
- `@neiro/utils` - Утилиты (JWT, валидация, форматирование)
- `express` - HTTP сервер
- `zod` - Валидация схем
- `minio` - S3-compatible клиент для хранения медиа

## 🔗 Связанные сервисы

- **Templates Service** - использует упражнения в шаблонах маршрутов
- **Route Orchestrator Service** - связывает упражнения с фазами и целями
- **Assignments Service** - назначает упражнения детям

## 📄 Лицензия

Proprietary - Neiro Platform © 2025

## 👥 Команда

- Backend разработка: Neiro Platform Team
- Архитектура: См. `Documents/ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md`
- API контракты: См. `Documents/API_CONTRACTS_MVP.md`


