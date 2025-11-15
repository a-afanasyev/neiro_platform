# 📋 Контекст проекта Neiro Platform

**Последнее обновление:** 2025-11-15  
**Версия:** 0.3.3

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
| **PostgreSQL** | `5432` | Стандартный порт PostgreSQL |
| **Redis** | `6379` | Стандартный порт Redis |
| **MinIO API** | `9000` | API порт MinIO |
| **MinIO Console** | `9001` | Console порт MinIO |

### Маппинг портов (docker-compose.yml)

```yaml
ports:
  - "3001:3000"  # Frontend: внешний:внутренний
  - "4001:4000"  # Auth Service: внешний:внутренний
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
│   └── web/              # Next.js 14 frontend
├── services/
│   ├── auth/             # Auth Service (порт 4000/4001)
│   ├── users/            # Users Service (порт 4002)
│   ├── children/         # Children Service (порт 4003)
│   └── diagnostics/     # Diagnostics Service (порт 4004)
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── types/            # Общие TypeScript типы
│   └── utils/            # Общие утилиты
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

```yaml
services:
  postgres:    # PostgreSQL 15
  redis:       # Redis 7
  minio:       # MinIO S3
  adminer:     # Database UI
  app:         # Node.js контейнер для разработки
```

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

---

## 🚀 Команды разработки

### Запуск сервисов

```bash
# Запустить все контейнеры
docker-compose up -d

# Запустить frontend
docker-compose exec app sh -c "cd apps/web && pnpm dev"

# Запустить auth service
docker-compose exec app sh -c "cd services/auth && pnpm dev"

# Запустить users service
docker-compose exec app sh -c "cd services/users && pnpm dev"

# Запустить children service
docker-compose exec app sh -c "cd services/children && pnpm dev"

# Запустить diagnostics service
docker-compose exec app sh -c "cd services/diagnostics && pnpm dev"
```

### Работа с базой данных

```bash
# Генерация Prisma Client
docker-compose exec app pnpm run db:generate

# Применение миграций
docker-compose exec app pnpm run db:migrate

# Заполнение тестовыми данными
docker-compose exec app pnpm run db:seed

# Prisma Studio (UI для БД)
docker-compose exec app pnpm run db:studio
```

### Установка зависимостей

```bash
# Установить все зависимости
docker-compose exec app pnpm install

# Установить зависимость в конкретный пакет
docker-compose exec app pnpm --filter @neiro/web add <package>
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

---

**Статус:** ✅ Актуально  
**Версия документа:** 1.1  
**Дата обновления:** 2025-11-15

