# Auth Service

> Сервис аутентификации и авторизации для Neiro Platform

## 📋 Функциональность

- ✅ JWT токены (access + refresh)
- ✅ Login/Logout
- ✅ User invitation (admin only)
- ✅ RBAC (Role-Based Access Control)
- ✅ Session management в Redis
- ✅ Rate limiting
- ✅ Event publishing (Outbox pattern)

## 🔐 API Endpoints

### Authentication

#### POST /auth/v1/login
Аутентификация пользователя

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Анвар",
    "lastName": "Иванов",
    "role": "parent",
    "status": "active"
  }
}
```

#### POST /auth/v1/refresh
Обновление access токена

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

#### POST /auth/v1/logout
Выход из системы

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** 204 No Content

#### POST /auth/v1/invite
Приглашение пользователя (admin only)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "email": "newuser@example.com",
  "role": "specialist",
  "firstName": "Мария",
  "lastName": "Нейропсихологова"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "role": "specialist",
  "status": "invited"
}
```

#### GET /auth/v1/me
Получение информации о текущем пользователе

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Анвар",
  "lastName": "Иванов",
  "role": "parent",
  "status": "active",
  "phone": "+998901234567",
  "timezone": "Asia/Tashkent",
  "specialist": null
}
```

## 🚀 Запуск

```bash
# В контейнере
docker-compose exec app pnpm --filter @neiro/auth-service dev

# Локально (если необходимо)
cd services/auth
pnpm install
pnpm dev
```

Сервис будет доступен на http://localhost:4001

## 🧪 Тестирование

```bash
# Unit тесты
docker-compose exec app pnpm --filter @neiro/auth-service test

# Проверка типов
docker-compose exec app pnpm --filter @neiro/auth-service type-check
```

## 🔑 Переменные окружения

```env
# JWT Secrets
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Redis
REDIS_URL=redis://redis:6379

# Database
DATABASE_URL=postgresql://neiro_user:neiro_password_dev@postgres:5432/neiro_platform

# Service
AUTH_SERVICE_PORT=4001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

## 📊 События

Сервис публикует следующие события через Outbox:

- `auth.user.invited` - пользователь приглашен
- `auth.user.activated` - пользователь активирован
- `auth.user.role_changed` - роль изменена
- `auth.user.suspended` - пользователь заблокирован
- `auth.user.logged_in` - вход в систему
- `auth.user.logged_out` - выход из системы

## 🔒 Безопасность

- JWT токены с коротким TTL (15 мин)
- Refresh токены хранятся в Redis (30 дней)
- Bcrypt для хеширования паролей (cost: 12)
- Rate limiting на критичных эндпоинтах
- Helmet для HTTP заголовков безопасности
- CORS настроен

## 📐 Архитектура

```
src/
├── controllers/        # Обработчики запросов
├── routes/            # Определение маршрутов
├── middleware/        # Middleware (auth, validation, RBAC)
├── services/          # Бизнес-логика (JWT, Redis, Events)
├── validators/        # Zod схемы валидации
└── utils/             # Утилиты (AppError)
```

## 🔄 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| POST /login | 5 req/min per IP |
| POST /refresh | 10 req/min per IP |
| POST /invite | 20 req/hour per admin |

## 🐛 Отладка

```bash
# Просмотр логов
docker-compose logs -f auth

# Проверка health
curl http://localhost:4001/health
```

## 📚 Документация

- [API Contracts](../../Documents/API_CONTRACTS_MVP.md)
- [Data Model](../../Documents/DATA_MODEL_AND_EVENTS.md)
- [Constitution](../../constitution.md)

## ✅ Constitution Check

- [x] Stack Compliance (Node.js + TypeScript + PostgreSQL)
- [x] Security Baseline (JWT, bcrypt, rate limiting)
- [x] Events (6 событий)
- [x] API Contract следует OpenAPI 3.1
- [x] Error handling (RFC 7807)
- [x] Observability (логирование)

