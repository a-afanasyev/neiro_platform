# Neiro Platform

> Комплексная веб-платформа для нейропсихологического сопровождения детей с РАС

## 🚀 Быстрый старт

### ⚠️ ВАЖНО: Всё исполнение происходит в Docker-контейнерах!

**ЗАПРЕЩЕНО:**
- ❌ Запускать Node.js/npm на хост-машине
- ❌ Устанавливать PostgreSQL/Redis локально
- ❌ Запускать `npm install`, `npm run dev` на хосте

**ПРАВИЛЬНО:**
- ✅ Все команды через `docker-compose exec app ...`
- ✅ Редактирование кода на хосте (файлы смонтированы)
- ✅ Исполнение всегда внутри контейнера

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

3. **Запустить все сервисы:**
   ```bash
   docker-compose up -d
   ```

4. **Установить зависимости (в контейнере!):**
   ```bash
   docker-compose exec app npm install
   ```

5. **Применить миграции БД:**
   ```bash
   docker-compose exec app npm run db:migrate
   ```

6. **Запустить seed-скрипты:**
   ```bash
   docker-compose exec app npm run db:seed
   ```

7. **Запустить приложение в dev-режиме:**
   ```bash
   docker-compose exec app npm run dev
   ```

### Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| **Next.js Frontend** | http://localhost:3001 | Веб-приложение |
| **Auth Service API** | http://localhost:4001 | API аутентификации |
| **Users Service API** | http://localhost:4002 | API управления пользователями |
| **Children Service API** | http://localhost:4003 | API управления детьми |
| **Diagnostics Service API** | http://localhost:4004 | API диагностики |
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
│   ├── auth/               # Аутентификация (порт 4000/4001)
│   ├── users/              # Управление пользователями (порт 4002)
│   ├── children/           # Управление детьми (порт 4003)
│   ├── diagnostics/        # Диагностика (порт 4004)
│   └── [планируется]      # route-orchestrator, exercises, assignments, reports, analytics, comms, templates, media, webhooks
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

### Команды разработки (всегда через docker-compose!)

```bash
# Установка нового пакета
docker-compose exec app npm install <package-name>

# Запуск dev-сервера
docker-compose exec app npm run dev

# Запуск тестов
docker-compose exec app npm test

# Линтинг
docker-compose exec app npm run lint

# Проверка типов
docker-compose exec app npm run type-check

# Работа с БД
docker-compose exec app npm run db:migrate      # Применить миграции
docker-compose exec app npm run db:push         # Push схемы без миграций
docker-compose exec app npm run db:studio       # Открыть Prisma Studio
docker-compose exec app npm run db:seed         # Запустить seed

# Генерация Prisma Client
docker-compose exec app npm run db:generate
```

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Перезапуск сервисов

```bash
# Перезапустить всё
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart app

# Пересобрать и перезапустить
docker-compose up -d --build
```

### Подключение к контейнеру для отладки

```bash
# Открыть shell в контейнере приложения
docker-compose exec app sh

# Или напрямую bash/sh
docker-compose exec app /bin/sh
```

## 📊 База данных

### Миграции

Prisma миграции создаются и применяются только внутри контейнера:

```bash
# Создать новую миграцию
docker-compose exec app npx prisma migrate dev --name migration_name

# Применить миграции в production
docker-compose exec app npx prisma migrate deploy

# Сбросить БД (удалить все данные)
docker-compose exec app npx prisma migrate reset
```

### Seed данные

Тестовые данные для разработки:

```bash
docker-compose exec app npm run db:seed
```

## 🧪 Тестирование

```bash
# Unit тесты
docker-compose exec app npm test

# E2E тесты
docker-compose exec app npm run test:e2e

# Coverage
docker-compose exec app npm run test:coverage
```

## 🔒 Безопасность

- **PostgreSQL порт**: 5437 (не стандартный 5432)
- **JWT secrets**: Обязательно измените в production
- **Bcrypt rounds**: 12 (можно увеличить для production)
- **Rate limiting**: Настроен на всех критичных эндпоинтах

## 📝 Конвенции кода

- **TypeScript**: Strict mode всегда включен
- **Форматирование**: Prettier (запуск: `docker-compose exec app npm run format`)
- **Линтинг**: ESLint с рекомендованными правилами
- **Коммиты**: Conventional Commits
- **Тесты**: Минимум 80% покрытия для критичного кода

## 🐳 Docker

### Очистка

```bash
# Остановить и удалить контейнеры
docker-compose down

# Удалить также volumes (ВНИМАНИЕ: удалит данные БД!)
docker-compose down -v

# Полная очистка (включая образы)
docker-compose down --rmi all -v
```

### Проблемы и решения

**Проблема**: Контейнер app не запускается
```bash
docker-compose logs app
docker-compose restart app
```

**Проблема**: БД недоступна
```bash
docker-compose restart postgres
docker-compose exec postgres pg_isready -U neiro_user
```

**Проблема**: Порты заняты
- Проверьте, что на хосте не запущены PostgreSQL (5437), Redis (6379), MinIO (9000, 9001)

## 📚 Документация

- [Техническое задание](../Documents/ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md)
- [API Контракты](../Documents/API_CONTRACTS_MVP.md)
- [Модель данных](../Documents/DATA_MODEL_AND_EVENTS.md)
- [Design System](../Documents/DESIGN_SYSTEM.md)
- [Конституция проекта](../constitution.md)

## 🤝 Contribution

1. Создайте feature branch
2. Внесите изменения
3. Запустите тесты: `docker-compose exec app npm test`
4. Создайте Pull Request

## 📞 Контакты

- **Tech Lead**: [email]
- **Product Manager**: [email]

## 📄 Лицензия

[License Type]

