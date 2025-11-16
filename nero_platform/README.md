# Neiro Platform

> Комплексная веб-платформа для нейропсихологического сопровождения детей с РАС

## 🚀 Быстрый старт

### ✅ Микросервисная архитектура

**Обновлено:** 16 ноября 2025

Платформа использует микросервисную архитектуру с отдельными контейнерами для каждого сервиса. Каждый микросервис запускается в своем Docker контейнере с автоматической установкой зависимостей и health checks.

**Ключевые особенности:**
- ✅ Отдельные контейнеры для каждого микросервиса (auth, users, children, diagnostics, routes, assignments, exercises, templates, web)
- ✅ Автоматическая установка зависимостей через `pnpm install --filter`
- ✅ Health checks для всех сервисов
- ✅ Общий network `neiro_network` для межсервисного взаимодействия
- ✅ Редактируйте код на хосте; контейнеры монтируют каталоги `apps/`, `services/`, `packages/`

### Предварительные требования

- Docker Desktop 4.0+ (с Docker Compose V2)
- Git

### Установка и запуск

1. **Клонировать репозиторий:**
   ```bash
   git clone <repository-url>
   cd nero_platform
   ```

2. **Создать файл окружения:**
   ```bash
   cp .env.example .env
   ```

3. **Установить зависимости (на хосте):**
   ```bash
   pnpm install
   ```

4. **Запустить инфраструктуру:**
   ```bash
   docker compose up -d postgres redis minio adminer
   ```

5. **Применить миграции БД:**
   ```bash
   docker compose exec -T auth sh -c "cd /app/packages/database && prisma migrate deploy"
   ```

6. **Загрузить seed данные:**
   ```bash
   docker compose exec -T auth sh -c "cd /app/packages/database && npx tsx prisma/seed.ts"
   ```

7. **Запустить все микросервисы и фронтенд:**
   ```bash
   docker compose up -d auth users children diagnostics routes assignments exercises templates web
   ```

8. **Проверить статус всех сервисов:**
   ```bash
   docker compose ps
   # Все сервисы должны быть в статусе "Up (healthy)"
   ```

   Или использовать скрипт проверки готовности:
   ```bash
   ./scripts/wait-for-services.sh
   ```

### Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| **Next.js Frontend** | http://localhost:3001 | Веб-приложение |
| **Auth Service API** | http://localhost:4001 | API аутентификации |
| **Users Service API** | http://localhost:4002 | API управления пользователями |
| **Children Service API** | http://localhost:4003 | API управления детьми |
| **Diagnostics Service API** | http://localhost:4004 | API диагностики |
| **Routes Service API** | http://localhost:4005 | API управления маршрутами |
| **Assignments Service API** | http://localhost:4006 | API управления назначениями |
| **Exercises Service API** | http://localhost:4007 | API библиотеки упражнений |
| **Templates Service API** | http://localhost:4008 | API шаблонов маршрутов |
| **Adminer (DB UI)** | http://localhost:8082 | UI управления БД |
| **MinIO Console** | http://localhost:9001 | UI управления MinIO |
| **PostgreSQL** | localhost:5437 | База данных |
| **Redis** | localhost:6380 | Кэш и очереди |

**Учетные данные:**
- **Adminer**: Server: `postgres`, User: `neiro_user`, Password: `neiro_password_dev`, Database: `neiro_platform`
- **MinIO**: Username: `minioadmin`, Password: `minioadmin123`
- **PostgreSQL**: User: `neiro_user`, Password: `neiro_password_dev`, Database: `neiro_platform`

## 📁 Структура проекта

```
nero_platform/
├── apps/                    # Приложения
│   ├── web/                # Next.js frontend
│   └── api/                # API Gateway/BFF
├── services/               # Микросервисы
│   ├── auth/               # Аутентификация (порт 4001)
│   ├── users/              # Управление пользователями (порт 4002)
│   ├── children/           # Управление детьми (порт 4003)
│   ├── diagnostics/        # Диагностика (порт 4004)
│   ├── routes/             # Управление маршрутами (порт 4005)
│   ├── assignments/        # Управление назначениями (порт 4006)
│   ├── exercises/          # Библиотека упражнений (порт 4007)
│   └── templates/          # Шаблоны маршрутов (порт 4008)
├── packages/               # Shared libraries
│   ├── database/           # Prisma схемы и клиент
│   ├── types/              # TypeScript типы
│   ├── ui/                 # UI компоненты
│   └── utils/              # Утилиты
├── infrastructure/         # Docker, K8s, CI/CD
└── docs/                   # Документация
```

## 🛠️ Разработка

### Работа с кодом

Редактируйте файлы на хосте в любимом редакторе. Изменения автоматически синхронизируются с контейнером благодаря volume mount.

### Команды разработки (через docker compose)

```bash
# Установка нового пакета (на хосте)
pnpm add <package-name> --filter <workspace>

# Запуск инфраструктуры
docker compose up -d postgres redis minio adminer

# Запуск конкретного сервиса
docker compose up -d auth            # или users/children/diagnostics/routes/assignments/exercises/templates/web

# Логи сервиса
docker compose logs -f auth

# Проверка типов/тесты с хоста (используют контейнерную БД/кэш)
pnpm --filter @neiro/auth test
pnpm --filter @neiro/auth lint
pnpm --filter @neiro/auth type-check

# Работа с БД
pnpm --filter @neiro/database prisma migrate dev
pnpm --filter @neiro/database prisma db seed
pnpm --filter @neiro/database prisma studio
pnpm --filter @neiro/database prisma generate
```

### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f auth   # или users/children/diagnostics/routes/assignments/exercises/templates/web
docker compose logs -f postgres
docker compose logs -f redis
```

### Перезапуск сервисов

```bash
# Перезапустить всё
docker compose restart

# Перезапустить конкретный сервис
docker compose restart auth

# Пересобрать и перезапустить
docker compose up -d --build
```

### Подключение к контейнеру для отладки

```bash
# Открыть shell в конкретном сервисе
docker compose exec auth sh          # или другой сервис: users/children/diagnostics/...
```

## 📊 База данных

### Миграции и seed

Рекомендуемый путь — выполнять Prisma из хоста, подключаясь к контейнерной БД:

```bash
# Создать новую миграцию
pnpm --filter @neiro/database prisma migrate dev --name <migration_name>

# Применить миграции (deploy)
pnpm --filter @neiro/database prisma migrate deploy

# Сбросить БД (удалит данные)
pnpm --filter @neiro/database prisma migrate reset

# Seed
pnpm --filter @neiro/database prisma db seed
```

## 🧪 Тестирование

```bash
# Unit/интеграционные тесты сервиса
pnpm --filter @neiro/auth test

# E2E тесты фронтенда
pnpm --filter @neiro/web test:e2e

# Coverage
pnpm --filter @neiro/auth test:coverage
```

## 🔒 Безопасность

- **PostgreSQL порт**: 5437 (не стандартный 5432)
- **JWT secrets**: Обязательно измените в production
- **Bcrypt rounds**: 12 (можно увеличить для production)
- **Rate limiting**: Настроен на всех критичных эндпоинтах

## 📝 Конвенции кода

- **TypeScript**: Strict mode всегда включен
- **Форматирование**: Prettier (запуск: `pnpm format`)
- **Линтинг**: ESLint с рекомендованными правилами
- **Коммиты**: Conventional Commits
- **Тесты**: Минимум 80% покрытия для критичного кода

## 🐳 Docker

### Очистка

```bash
# Остановить и удалить контейнеры
docker compose down

# Удалить также volumes (ВНИМАНИЕ: удалит данные БД!)
docker compose down -v

# Полная очистка (включая образы)
docker compose down --rmi all -v
```

### Troubleshooting

**Проблема**: Сервис не стартует
```bash
# Проверить логи
docker compose logs -f auth     # заменить на нужный сервис

# Перезапустить сервис
docker compose restart auth

# Проверить health check
curl http://localhost:4001/health
```

**Проблема**: БД недоступна
```bash
docker compose restart postgres
docker compose exec postgres pg_isready -U neiro_user

# Проверить подключение
docker compose exec postgres psql -U neiro_user -d neiro_platform -c "SELECT 1;"
```

**Проблема**: Порты заняты
- Проверьте, что на хосте не запущены PostgreSQL (5437), Redis (6380), MinIO (9000, 9001)
- Используйте `lsof -i :PORT` для проверки занятых портов

**Проблема**: Зависимости не устанавливаются
```bash
# Пересобрать контейнер
docker compose up -d --build auth

# Проверить установку зависимостей вручную
docker compose exec auth sh -c "cd /app && pnpm install"
```

**Проблема**: Health check не проходит
```bash
# Проверить статус health check
docker compose ps

# Проверить endpoint вручную
curl http://localhost:4001/health

# Проверить логи сервиса
docker compose logs --tail=50 auth
```

**Проблема**: Ошибка "Module not found" в сервисе
- Убедитесь, что зависимости установлены: `docker compose exec auth sh -c "cd /app && pnpm install"`
- Проверьте, что workspace зависимости правильно разрешаются через `pnpm --filter`

## 📚 Документация

- [Техническое задание](Documents/ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md) - Single Source of Truth
- [API Контракты](Documents/API_CONTRACTS_MVP.md)
- [Модель данных](Documents/DATA_MODEL_AND_EVENTS.md)
- [Design System](Documents/DESIGN_SYSTEM.md)
- [Конституция проекта](constitution.md)
- [Отчет о миграции и тестировании](Documents/MIGRATION_AND_TESTING_REPORT.md) - Результаты миграции на микросервисную архитектуру
- [План миграции](2-route-orchestrator.plan.md) - Детальный план миграции

## 🤝 Contribution

1. Создайте feature branch
2. Внесите изменения
3. Запустите тесты: `pnpm --filter @neiro/auth test` (или нужный сервис)
4. Создайте Pull Request

## 📞 Контакты

- **Tech Lead**: [email]
- **Product Manager**: [email]

## 📄 Лицензия

[License Type]
