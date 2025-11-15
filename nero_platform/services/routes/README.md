# Route Orchestrator Service

Микросервис управления коррекционными маршрутами детей для Neiro Platform.

## 🎯 Назначение

Route Orchestrator Service отвечает за:
- Создание, чтение, обновление маршрутов для детей
- Управление фазами, целями и контрольными точками (milestones)
- Применение шаблонов к конкретным маршрутам
- Активация, приостановка и завершение маршрутов
- Валидация Constitution Check бизнес-правил
- Версионирование маршрутов
- Интеграцию с Diagnostics Service для получения рекомендаций
- Публикацию доменных событий в Postgres Outbox

## 📋 API Endpoints

### Базовый URL: `/routes/v1`

| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/` | Список маршрутов с фильтрацией | specialist, supervisor, admin |
| GET | `/:id` | Получение маршрута с фазами и целями | specialist, supervisor, admin |
| POST | `/` | Создание нового маршрута | specialist, supervisor, admin |
| PATCH | `/:id` | Обновление маршрута | specialist, supervisor, admin |
| POST | `/:id/activate` | Активация маршрута | specialist, supervisor, admin |
| POST | `/:id/pause` | Приостановка маршрута | specialist, supervisor, admin |
| POST | `/:id/complete` | Завершение маршрута | specialist, supervisor, admin |
| GET | `/:id/phases` | Список фаз маршрута | specialist, supervisor, admin |
| POST | `/:id/phases` | Создание фазы | specialist, supervisor, admin |
| PATCH | `/:id/phases/:phaseId` | Обновление фазы | specialist, supervisor, admin |
| GET | `/:id/goals` | Список целей маршрута | specialist, supervisor, admin |
| POST | `/:id/goals` | Создание цели | specialist, supervisor, admin |
| PATCH | `/:id/goals/:goalId` | Обновление цели | specialist, supervisor, admin |
| POST | `/:id/milestones/:milestoneId/complete` | Завершение контрольной точки | specialist, supervisor, admin |

### Health Check

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/health` | Статус сервиса |

## 🔧 Конфигурация

### Environment Variables

```env
# Сервис
ROUTES_SERVICE_PORT=4005

# База данных (из @neiro/database)
DATABASE_URL=postgresql://neiro_user:neiro_password_dev@postgres:5432/neiro_platform

# CORS
CORS_ORIGIN=http://localhost:3001

# JWT (для аутентификации)
JWT_ACCESS_SECRET=dev_access_secret_change_in_production_2024
```

## 🚀 Запуск

```bash
# Development
docker-compose exec app pnpm --filter @neiro/routes dev

# Production
docker-compose exec app pnpm --filter @neiro/routes build
docker-compose exec app pnpm --filter @neiro/routes start

# Tests
docker-compose exec app pnpm --filter @neiro/routes test
```

## 📊 Constitution Check Rules

Сервис валидирует следующие бизнес-правила:

1. Фаза без маршрута недопустима
2. Единственный активный маршрут на ребенка
3. Нельзя активировать пустой маршрут (без фаз и целей)
4. Цель должна быть связана с хотя бы одной фазой
5. Миграционные маршруты требуют ссылки на источник
6. И др.

## 📡 События (Postgres Outbox)

| Событие | Условие |
|---------|---------|
| `routes.route.created` | Маршрут создан |
| `routes.route.activated` | Маршрут активирован |
| `routes.route.updated` | Маршрут обновлен |
| `routes.route.completed` | Маршрут завершен |
| `routes.goal.status_changed` | Статус цели изменен |
| `routes.goal.exercise_linked` | Упражнение привязано к цели |
| `routes.phase.created` | Фаза создана |
| `routes.phase.status_changed` | Статус фазы изменен |
| `routes.milestone.completed` | Контрольная точка завершена |
| `routes.template.applied` | Шаблон применен к маршруту |

## 🔗 Связанные сервисы

- **Templates Service** - применение шаблонов к маршрутам
- **Exercises Service** - связывание упражнений с фазами и целями
- **Diagnostics Service** - получение рекомендаций целей
- **Assignments Service** - создание назначений по фазам
- **Children Service** - привязка маршрутов к детям

## 📄 Лицензия

Proprietary - Neiro Platform © 2025


