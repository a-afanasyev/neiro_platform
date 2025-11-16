# 📋 Контекст проекта Neiro Platform

**Последнее обновление:** 2025-11-16  
**Версия:** 0.4.0

**Миграция на микросервисную архитектуру:** ✅ Завершена 16 ноября 2025  
**Отчет:** [`nero_platform/Documents/MIGRATION_AND_TESTING_REPORT.md`](nero_platform/Documents/MIGRATION_AND_TESTING_REPORT.md)

---

## 🌐 Порты и сервисы

### Внешние порты (доступ с хоста)

| Сервис | Порт | URL | Описание |
|--------|------|-----|----------|
| **Frontend (Next.js)** | `3001` | http://localhost:3001 | Веб-приложение |
| **Auth Service** | `4001` | http://localhost:4001 | API аутентификации |
| **Users Service** | `4002` | http://localhost:4002 | API управления пользователями |
| **Children Service** | `4003` | http://localhost:4003 | API управления детьми |
| **Diagnostics Service** | `4004` | http://localhost:4004 | API диагностики |
| **Routes Service** | `4005` | http://localhost:4005 | API управления маршрутами |
| **Assignments Service** | `4006` | http://localhost:4006 | API управления назначениями |
| **Exercises Service** | `4007` | http://localhost:4007 | API библиотеки упражнений |
| **Templates Service** | `4008` | http://localhost:4008 | API шаблонов маршрутов |
| **PostgreSQL** | `5437` | localhost:5437 | База данных |
| **Redis** | `6380` | localhost:6380 | Кэш и очереди |
| **MinIO API** | `9000` | http://localhost:9000 | S3-совместимое хранилище |
| **MinIO Console** | `9001` | http://localhost:9001 | UI управления MinIO |
| **Adminer** | `8082` | http://localhost:8082 | UI управления БД |

### Внутренние порты (внутри Docker контейнера)

| Сервис | Порт | Описание |
|--------|------|----------|
| **Frontend (Next.js)** | `3000` | Слушает внутри контейнера |
| **Auth Service** | `4000` | Слушает внутри контейнера |
| **Users Service** | `4002` | Слушает внутри контейнера |
| **Children Service** | `4003` | Слушает внутри контейнера |
| **Diagnostics Service** | `4004` | Слушает внутри контейнера |
| **Routes Service** | `4005` | Слушает внутри контейнера |
| **Assignments Service** | `4006` | Слушает внутри контейнера |
| **Exercises Service** | `4007` | Слушает внутри контейнера |
| **Templates Service** | `4008` | Слушает внутри контейнера |
| **PostgreSQL** | `5432` | Стандартный порт PostgreSQL |
| **Redis** | `6379` | Стандартный порт Redis |
| **MinIO API** | `9000` | API порт MinIO |
| **MinIO Console** | `9001` | Console порт MinIO |

### Маппинг портов (docker-compose.yml)

```yaml
ports:
  - "3001:3000"  # Frontend: внешний:внутренний
  - "4001:4000"  # Auth Service: внешний:внутренний
  - "4002:4002"  # Users Service
  - "4003:4003"  # Children Service
  - "4004:4004"  # Diagnostics Service
  - "4005:4005"  # Routes Service
  - "4006:4006"  # Assignments Service
  - "4007:4007"  # Exercises Service
  - "4008:4008"  # Templates Service
  - "5437:5432"  # PostgreSQL: внешний:внутренний
  - "6380:6379"  # Redis: внешний:внутренний
  - "9000:9000"  # MinIO API
  - "9001:9001"  # MinIO Console
  - "8082:8080"  # Adminer
```

---

## 🗄️ База данных

### Подключение

```env
DATABASE_URL=postgresql://neiro_user:neiro_password_dev@postgres:5432/neiro_platform
```

### Параметры подключения

- **Host (внутри контейнера):** `postgres`
- **Host (с хоста):** `localhost`
- **Port (внутри контейнера):** `5432`
- **Port (с хоста):** `5437`
- **Database:** `neiro_platform`
- **User:** `neiro_user`
- **Password:** `neiro_password_dev`

### Основные таблицы (Prisma Schema)

#### Пользователи и аутентификация
- `users` - Пользователи системы (роли: admin, specialist, supervisor, parent)
- `specialist` - Профили специалистов

#### Дети и семьи
- `child` - Профили детей с РАС
- `child_parent` - Связь ребенок-родитель (M:N)
- `child_specialist` - Связь ребенок-специалист (M:N)

#### Диагностика
- `questionnaire` - Опросники (ADOS-2, CARS-2, ATEC)
- `diagnostic_session` - Сессии диагностики
- `diagnostic_response` - Ответы на вопросы

#### Коррекционные маршруты
- `route` - Коррекционные маршруты
- `route_stage` - Этапы маршрута
- `exercise` - Упражнения
- `exercise_template` - Шаблоны упражнений
- `assignment` - Назначенные задания

#### События и аудит
- `event_outbox` - Postgres Outbox для событий
- `audit_log` - Логи изменений

---

## 🔐 Аутентификация и авторизация

### Роли пользователей (lowercase)

```typescript
type UserRole = 'admin' | 'specialist' | 'supervisor' | 'parent'
```

**Важно:** Все роли хранятся в lowercase в базе данных!

### Тестовые аккаунты

| Email | Пароль | Роль | Описание |
|-------|--------|------|----------|
| `admin@neiro.dev` | `admin123` | `admin` | Администратор системы |
| `supervisor@neiro.dev` | `supervisor123` | `supervisor` | Супервизор |
| `specialist1@neiro.dev` | `specialist123` | `specialist` | Специалист |
| `parent1@neiro.dev` | `parent123` | `parent` | Родитель |

### JWT токены

- **Access Token:** Короткоживущий (15 минут)
- **Refresh Token:** Долгоживущий (7 дней)
- **Алгоритм:** HS256

### API Endpoints

#### Auth Service (`/auth/v1`)

- `POST /auth/v1/login` - Вход в систему
- `POST /auth/v1/refresh` - Обновление токена
- `POST /auth/v1/logout` - Выход из системы
- `POST /auth/v1/invite` - Приглашение пользователя
- `GET /health` - Health check

---

## 🏗️ Архитектура

### Монорепозиторий структура

```
nero_platform/
├── apps/
│   └── web/              # Next.js 14 frontend (порт 3001)
├── services/             # Микросервисы (каждый в отдельном контейнере)
│   ├── auth/             # Auth Service (порт 4001)
│   ├── users/            # Users Service (порт 4002)
│   ├── children/         # Children Service (порт 4003)
│   ├── diagnostics/     # Diagnostics Service (порт 4004)
│   ├── routes/           # Routes Service (порт 4005)
│   ├── assignments/      # Assignments Service (порт 4006)
│   ├── exercises/        # Exercises Service (порт 4007)
│   └── templates/        # Templates Service (порт 4008)
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── types/            # Общие TypeScript типы
│   └── utils/            # Общие утилиты
├── scripts/              # Вспомогательные скрипты
│   ├── wait-for-services.sh  # Скрипт проверки готовности сервисов
│   └── test-api-simple.sh    # Скрипт тестирования API
└── infrastructure/       # Docker, CI/CD
```

### Технологический стек

#### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State Management:** Zustand
- **HTTP Client:** Axios
- **UI Components:** Radix UI
- **Styling:** Tailwind CSS
- **Testing:** Jest, Playwright

#### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Cache/Queue:** Redis 7
- **Storage:** MinIO (S3-compatible)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt

#### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Package Manager:** pnpm 8.15.0
- **Build System:** Turborepo
- **CI/CD:** GitHub Actions

---

## 🔧 Конфигурация

### Environment Variables

#### Frontend (Next.js)

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

#### Backend Services

```env
# Database
DATABASE_URL=postgresql://neiro_user:neiro_password_dev@postgres:5432/neiro_platform

# Redis
REDIS_URL=redis://redis:6379

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_USE_SSL=false

# CORS
CORS_ORIGIN=http://localhost:3001

# Service Ports (внутри контейнера)
AUTH_SERVICE_PORT=4000
USERS_SERVICE_PORT=4002
CHILDREN_SERVICE_PORT=4003
PORT=4004  # Diagnostics Service
```

### Docker Compose Services

**Обновлено:** 16 ноября 2025 - Микросервисная архитектура

```yaml
services:
  # Инфраструктура
  postgres:      # PostgreSQL 15
  redis:         # Redis 7
  minio:         # MinIO S3
  adminer:       # Database UI
  
  # Микросервисы (каждый в отдельном контейнере)
  auth:          # Auth Service (порт 4001)
  users:         # Users Service (порт 4002)
  children:      # Children Service (порт 4003)
  diagnostics:   # Diagnostics Service (порт 4004)
  routes:        # Routes Service (порт 4005)
  assignments:   # Assignments Service (порт 4006)
  exercises:     # Exercises Service (порт 4007)
  templates:     # Templates Service (порт 4008)
  
  # Frontend
  web:           # Next.js Frontend (порт 3001)
```

**Ключевые особенности:**
- ✅ Каждый микросервис запускается в отдельном контейнере
- ✅ Автоматическая установка зависимостей через `pnpm install --filter`
- ✅ Health checks для всех сервисов
- ✅ Общий network `neiro_network` для межсервисного взаимодействия

---

## 📡 API Endpoints

### Auth Service (`http://localhost:4001`)

```
POST   /auth/v1/login
POST   /auth/v1/refresh
POST   /auth/v1/logout
POST   /auth/v1/invite
GET    /health
```

### Users Service (`http://localhost:4002`)

```
GET    /users/v1
GET    /users/v1/:id
PUT    /users/v1/:id
DELETE /users/v1/:id
GET    /users/v1/specialists
GET    /users/v1/specialists/:id
PUT    /users/v1/specialists/:id
GET    /health
```

### Children Service (`http://localhost:4003`)

```
GET    /children/v1
POST   /children/v1
GET    /children/v1/:id
PUT    /children/v1/:id
DELETE /children/v1/:id
POST   /children/v1/:id/parents
POST   /children/v1/:id/specialists
GET    /health
```

### Diagnostics Service (`http://localhost:4004`)

```
GET    /diagnostics/v1/questionnaires
GET    /diagnostics/v1/questionnaires/:code
POST   /diagnostics/v1/sessions
GET    /diagnostics/v1/sessions
GET    /diagnostics/v1/sessions/:id
PUT    /diagnostics/v1/sessions/:id
POST   /diagnostics/v1/sessions/:id/responses
POST   /diagnostics/v1/sessions/:id/complete
GET    /diagnostics/v1/sessions/:id/results
GET    /health
```

### Routes Service (`http://localhost:4005`)

```
POST   /routes/v1
GET    /routes/v1
GET    /routes/v1/:id
PATCH  /routes/v1/:id
POST   /routes/v1/:id/activate
POST   /routes/v1/:id/complete
GET    /health
```

### Assignments Service (`http://localhost:4006`)

```
POST   /assignments/v1
GET    /assignments/v1
GET    /assignments/v1/:id
PATCH  /assignments/v1/:id/status
GET    /assignments/v1/calendar
GET    /health
```

### Exercises Service (`http://localhost:4007`)

```
POST   /exercises/v1
GET    /exercises/v1
GET    /exercises/v1/:id
GET    /exercises/v1/categories
POST   /exercises/v1/:id/publish
GET    /health
```

### Templates Service (`http://localhost:4008`)

```
POST   /templates/v1
GET    /templates/v1
GET    /templates/v1/:id
POST   /templates/v1/:id/clone
POST   /templates/v1/:id/publish
GET    /health
```

---

## 🚀 Команды разработки

### Запуск сервисов

**Обновлено:** 16 ноября 2025 - Микросервисная архитектура

```bash
# Запустить инфраструктуру
docker compose up -d postgres redis minio adminer

# Применить миграции БД
docker compose exec -T auth sh -c "cd /app/packages/database && prisma migrate deploy"

# Загрузить seed данные
docker compose exec -T auth sh -c "cd /app/packages/database && npx tsx prisma/seed.ts"

# Запустить все микросервисы и фронтенд
docker compose up -d auth users children diagnostics routes assignments exercises templates web

# Проверить статус всех сервисов
docker compose ps

# Проверить готовность всех сервисов (скрипт)
./scripts/wait-for-services.sh

# Логи конкретного сервиса
docker compose logs -f auth
docker compose logs -f users
# и т.д.
```

### Работа с базой данных

```bash
# Применение миграций (из контейнера auth)
docker compose exec -T auth sh -c "cd /app/packages/database && prisma migrate deploy"

# Заполнение тестовыми данными
docker compose exec -T auth sh -c "cd /app/packages/database && npx tsx prisma/seed.ts"

# Prisma Studio (с хоста, подключаясь к контейнерной БД)
pnpm --filter @neiro/database prisma studio

# Генерация Prisma Client
pnpm --filter @neiro/database prisma generate
```

### Установка зависимостей

**Обновлено:** 16 ноября 2025

Зависимости устанавливаются автоматически при запуске контейнеров через `pnpm install --filter @neiro/<service> --recursive`.

```bash
# Установить зависимости вручную (если требуется)
docker compose exec auth sh -c "cd /app && pnpm install"

# Установить зависимость в конкретный пакет (с хоста)
pnpm --filter @neiro/web add <package>
```

---

## ✅ Примененные патчи

### v0.3.1 - Password Validation Bypass
- ✅ Добавлено поле `password` в User schema
- ✅ Включена валидация паролей с bcrypt
- ✅ Обновлен seed script

### v0.3.2 - API Response Format
- ✅ Приведен формат API к `ApiResponse<T>`
- ✅ Исправлен refresh token handler

### v0.3.3 - Role Case Mismatch и Rate Limiting
- ✅ Все роли приведены к lowercase
- ✅ Исправлены все role checks (27 проверок)
- ✅ Исправлены useAuth методы
- ✅ Rate limiting установлен на 100 попыток в минуту
- ✅ CORS настроен корректно (OPTIONS запросы игнорируются в rate limiter)
- ✅ Исправлены ошибки Tailwind CSS (border-border класс)
- ✅ Исправлена структура Next.js роутинга (app/ и src/app/ конфликт)

---

## 📝 Важные заметки

### Порты

⚠️ **Важно:** Порты на хосте отличаются от портов внутри контейнера!

- Frontend: `3001` (хост) → `3000` (контейнер)
- Auth Service: `4001` (хост) → `4000` (контейнер)
- PostgreSQL: `5437` (хост) → `5432` (контейнер)
- Redis: `6380` (хост) → `6379` (контейнер)

### Роли

⚠️ **Критично:** Все роли в lowercase!

- ✅ Правильно: `'admin'`, `'specialist'`, `'parent'`
- ❌ Неправильно: `'ADMIN'`, `'SPECIALIST'`, `'PARENT'`

### CORS

CORS настроен на `http://localhost:3001` (внешний порт frontend).

### Database URL

Внутри контейнера используйте: `postgres:5432`  
С хоста используйте: `localhost:5437`

---

## 🔗 Полезные ссылки

- **Frontend:** http://localhost:3001
- **Adminer (DB UI):** http://localhost:8082
- **MinIO Console:** http://localhost:9001
- **Auth Service Health:** http://localhost:4001/health
- **Users Service Health:** http://localhost:4002/health
- **Children Service Health:** http://localhost:4003/health
- **Diagnostics Service Health:** http://localhost:4004/health
- **Routes Service Health:** http://localhost:4005/health
- **Assignments Service Health:** http://localhost:4006/health
- **Exercises Service Health:** http://localhost:4007/health
- **Templates Service Health:** http://localhost:4008/health

---

### Rate Limiting

⚠️ **Важно:** Rate limiting установлен на 100 попыток в минуту!

- **Auth Service:** 100 запросов в минуту на IP для `/auth/v1/login`
- **API Service:** 100 запросов в минуту на IP для общих API запросов
- **OPTIONS запросы:** Игнорируются rate limiter (preflight для CORS)

### Тестирование

✅ **Полная проверка функционала проведена:** 15 ноября 2025

- ✅ Все страницы работают корректно
- ✅ Авторизация работает для всех ролей
- ✅ Dashboard адаптируется под роль
- ✅ ProtectedRoute защищает маршруты
- ✅ Подробный отчет: `Documents/ПОЛНАЯ_ПРОВЕРКА_МЕСЯЦ_1.md`

✅ **Миграция на микросервисную архитектуру:** 16 ноября 2025

- ✅ Все 8 микросервисов запущены и работают
- ✅ Функциональное тестирование API: 95% успешных тестов (19/20)
- ✅ E2E тестирование фронтенда: 67% успешных тестов (2/3)
- ✅ Health checks для всех сервисов работают
- ✅ Подробный отчет: `nero_platform/Documents/MIGRATION_AND_TESTING_REPORT.md`

**Найденные проблемы:**
- ⚠️ Отсутствует компонент `@/components/ui/badge` (страница маршрутов не загружается)
- ⚠️ Ошибка 500 в Children API при получении списка детей

---

**Статус:** ✅ Актуально  
**Версия документа:** 1.2  
**Дата обновления:** 2025-11-16

