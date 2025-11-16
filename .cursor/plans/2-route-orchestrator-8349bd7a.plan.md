<!-- 8349bd7a-061c-47bc-b1aa-2685fcdb12c1 e3991091-2d37-4175-b493-dfa684c25abf -->
# План миграции на микросервисную архитектуру и тестирование

## Фаза 1: Подготовка новой конфигурации

### 1.1. Создать новый docker-compose.yml

Заменить текущий монолитный контейнер app на отдельные контейнеры для каждого микросервиса.

**Ключевые изменения:**

- Использовать YAML anchors для общих настроек (`x-common-variables`, `x-service-template`)
- Создать отдельные контейнеры: auth, users, children, diagnostics, routes, assignments, exercises, templates, web
- Каждый контейнер запускает `pnpm dev` напрямую (без Turbo!)
- Добавить healthchecks для автоматической проверки работоспособности
- Создать dedicated network `neiro_network`
- Отдельные volumes для node_modules каждого сервиса

**Файл:** `docker-compose.yml`

**Структура для каждого сервиса:**

```yaml
service_name:
  build:
    context: .
    dockerfile: Dockerfile.dev
  container_name: neiro_service_name
  ports:
    - "PORT:PORT"
  working_dir: /app/services/service_name
  command: pnpm dev
  volumes:
    - ./services/service_name:/app/services/service_name
    - ./packages:/app/packages:ro
    - service_nm:/app/services/service_name/node_modules
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:PORT/health"]
```

### 1.2. Создать скрипт для проверки готовности сервисов

Bash скрипт для ожидания запуска всех healthchecks.

**Файл:** `scripts/wait-for-services.sh`

## Фаза 2: Очистка и миграция

### 2.1. Остановить текущую конфигурацию

```bash
docker-compose down
```

### 2.2. Удалить volumes для чистой БД

```bash
docker volume rm nero_platform_postgres_data
docker volume rm nero_platform_redis_data
docker volume rm nero_platform_minio_data
```

### 2.3. Пересобрать образы с новой конфигурацией

```bash
docker-compose build --no-cache
```

## Фаза 3: Запуск новой архитектуры

### 3.1. Запустить инфраструктуру

```bash
docker-compose up -d postgres redis minio adminer
```

Дождаться healthy статуса всех сервисов.

### 3.2. Установить зависимости в каждом контейнере

Для каждого сервиса (auth, users, children, diagnostics, routes, assignments, exercises, templates, web):

```bash
docker-compose run --rm SERVICE_NAME pnpm install
```

### 3.3. Применить миграции БД

```bash
docker-compose run --rm auth sh -c "cd /app/packages/database && prisma migrate dev"
```

### 3.4. Загрузить seed данные

```bash
docker-compose run --rm auth sh -c "cd /app/packages/database && prisma db seed"
```

### 3.5. Запустить все микросервисы

```bash
docker-compose up -d auth users children diagnostics routes assignments exercises templates web
```

### 3.6. Проверить статус всех контейнеров

```bash
docker-compose ps
```

Все сервисы должны быть в статусе `Up (healthy)`.

## Фаза 4: Функциональное тестирование API

Создать скрипт `scripts/test-api.sh` для тестирования всех endpoints.

### 4.1. Auth API (порт 4001)

- POST /auth/v1/register - регистрация нового пользователя
- POST /auth/v1/login - логин (получить access/refresh tokens)
- POST /auth/v1/refresh - обновление access token
- POST /auth/v1/logout - выход из системы
- GET /health - проверка работоспособности

**Критерии успеха:** HTTP 200/201, валидные JWT токены в ответе

### 4.2. Users API (порт 4002)

- GET /users/v1 - список пользователей (требует auth)
- GET /users/v1/:id - получение пользователя по ID
- PATCH /users/v1/:id - обновление пользователя
- GET /health - проверка работоспособности

**Критерии успеха:** HTTP 200, корректная структура данных User

### 4.3. Children API (порт 4003)

- POST /children/v1 - создание ребенка
- GET /children/v1 - список детей
- GET /children/v1/:id - получение ребенка по ID
- PATCH /children/v1/:id - обновление данных ребенка
- DELETE /children/v1/:id - удаление ребенка
- GET /health - проверка работоспособности

**Критерии успеха:** HTTP 200/201, CRUD операции работают

### 4.4. Diagnostics API (порт 4004)

- POST /diagnostics/v1 - создание диагностики
- GET /diagnostics/v1 - список диагностик
- GET /diagnostics/v1/:id - получение диагностики
- GET /health - проверка работоспособности

**Критерии успеха:** HTTP 200/201, диагностики создаются и читаются

### 4.5. Routes API (порт 4005)

- POST /routes/v1 - создание маршрута
- GET /routes/v1 - список маршрутов
- GET /routes/v1/:id - получение маршрута с фазами и целями
- PATCH /routes/v1/:id - обновление маршрута
- POST /routes/v1/:id/activate - активация маршрута
- POST /routes/v1/:id/complete - завершение маршрута
- GET /health - проверка работоспособности

**Критерии успеха:** HTTP 200/201, все операции с маршрутами работают

### 4.6. Assignments API (порт 4006)

- POST /assignments/v1 - создание назначения
- GET /assignments/v1 - список назначений
- GET /assignments/v1/:id - получение назначения
- PATCH /assignments/v1/:id/status - изменение статуса (completed, cancelled)
- GET /assignments/v1/calendar - календарь назначений
- GET /health - проверка работоспособности

**Критерии успеха:** HTTP 200/201, управление назначениями работает

### 4.7. Exercises API (порт 4007)

- POST /exercises/v1 - создание упражнения
- GET /exercises/v1 - список упражнений с фильтрами
- GET /exercises/v1/:id - получение упражнения
- GET /exercises/v1/categories - получение категорий
- POST /exercises/v1/:id/publish - публикация упражнения
- GET /health - проверка работоспособности

**Критерии успеха:** HTTP 200/201, MinIO инициализирован, фильтрация работает

### 4.8. Templates API (порт 4008)

- POST /templates/v1 - создание шаблона
- GET /templates/v1 - список шаблонов
- GET /templates/v1/:id - получение шаблона с фазами и целями
- POST /templates/v1/:id/clone - клонирование шаблона
- POST /templates/v1/:id/publish - публикация шаблона
- GET /health - проверка работоспособности

**Критерии успеха:** HTTP 200/201, версионирование шаблонов работает

## Фаза 5: E2E тестирование фронтенда

Использовать browser MCP для автоматизированного тестирования UI.

### 5.1. Запустить браузер и открыть приложение

```
browser_navigate http://localhost:3001
```

### 5.2. Тестирование регистрации

- Перейти на /register
- Заполнить форму регистрации (email, password, firstName, lastName, role: parent)
- Отправить форму
- Проверить успешную регистрацию и редирект

### 5.3. Тестирование логина

- Перейти на /login
- Ввести credentials
- Проверить успешный вход и редирект на /dashboard

### 5.4. Тестирование навигации

- Проверить наличие sidebar навигации
- Проверить доступные пункты меню в зависимости от роли
- Проверить переходы между страницами

### 5.5. Тестирование страницы маршрутов

- Перейти на /dashboard/routes
- Проверить отображение списка маршрутов
- Проверить работу фильтров

### 5.6. Тестирование страницы упражнений

- Перейти на /dashboard/exercises
- Проверить отображение библиотеки упражнений
- Проверить фильтрацию по категориям

### 5.7. Тестирование страницы назначений

- Перейти на /dashboard/assignments
- Проверить отображение календаря назначений

### 5.8. Проверка RBAC

- Попытка доступа к защищенным страницам
- Проверка редиректа для неавторизованных пользователей

## Фаза 6: Сбор метрик и отчетность

### 6.1. Собрать минимальные метрики

- Время запуска каждого контейнера (из docker-compose logs)
- Среднее время ответа каждого API endpoint (из curl -w)
- Статус healthchecks всех сервисов
- Использование памяти контейнеров (docker stats)

### 6.2. Создать отчет о тестировании

**Файл:** `Documents/MIGRATION_AND_TESTING_REPORT.md`

**Структура отчета:**

1. Обзор миграции (до/после)
2. Результаты запуска сервисов
3. Результаты функционального тестирования API (таблица с результатами)
4. Результаты E2E тестирования фронтенда
5. Минимальные метрики производительности
6. Найденные проблемы и решения
7. Рекомендации

### 6.3. Обновить основную документацию

- Обновить README.md с новыми инструкциями запуска
- Добавить troubleshooting секцию
- Документировать новую архитектуру

## Критерии успешного завершения

- Все 8 микросервисов запущены и отвечают на health checks
- Фронтенд доступен на порту 3001
- Все функциональные тесты API пройдены (зеленый статус)
- E2E тесты фронтенда выполнены успешно
- Создан детальный отчет с метриками
- Документация обновлена

### To-dos

- [ ] Тестирование Auth API (регистрация, логин, refresh token)
- [ ] Тестирование Users API (создание, получение, обновление пользователей)
- [ ] Тестирование Children API (создание, получение, обновление детей)
- [ ] Тестирование Exercises API (создание, получение, список, категории)
- [ ] Тестирование Templates API (создание, получение, клонирование)
- [ ] Тестирование Routes API (создание, получение, активация маршрутов)
- [ ] Тестирование Assignments API (создание, получение, изменение статуса)