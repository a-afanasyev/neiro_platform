# Neiro Platform - Контекст Проекта

**Последнее обновление:** 2025-12-09
**Статус:** Месяцы 1-3 завершены на 95-100%

## 🎯 О Проекте

**Neiro Platform** - платформа для управления развитием детей с особыми потребностями. Включает функционал для специалистов, родителей и администраторов.

### Основные роли
- **Admin** - администратор платформы
- **Specialist** - специалист, создающий программы развития
- **Parent** - родитель, выполняющий упражнения с ребенком
- **Supervisor** - супервизор, контролирующий работу специалистов

---

## 🏗️ Архитектура

### Структура проекта
```
/Users/andreyafanasyev/Projects/Platform/
└── nero_platform/              # Основная директория (monorepo)
    ├── apps/web/              # Next.js фронтенд
    │   ├── src/
    │   │   ├── app/           # Next.js App Router
    │   │   │   └── dashboard/ # Страницы дашборда
    │   │   └── components/    # React компоненты
    │   │       ├── analytics/
    │   │       ├── reports/
    │   │       ├── notifications/
    │   │       └── ui/
    │   └── e2e/              # Playwright тесты
    ├── services/             # Backend микросервисы
    │   ├── auth/            # Port 4001
    │   ├── users/           # Port 4002
    │   ├── children/        # Port 4003
    │   ├── routes/          # Port 4005
    │   ├── assignments/     # Port 4006
    │   ├── exercises/       # Port 4007
    │   ├── templates/       # Port 4008
    │   ├── reports/         # Port 4009 (Month 3)
    │   ├── analytics/       # Port 4010 (Month 3)
    │   └── notifications/   # Port 4011 (Month 3)
    ├── packages/
    │   └── database/        # Prisma schema + migrations
    └── scripts/             # Утилиты

```

### Технологический стек

**Backend:**
- Node.js + TypeScript + Express
- PostgreSQL + Prisma ORM
- Redis (кеширование)
- MinIO (S3-compatible storage)
- JWT для авторизации
- Микросервисная архитектура

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- Recharts для графиков
- React Hook Form + Zod

**Infrastructure:**
- Docker + Docker Compose
- pnpm workspace (monorepo)
- Playwright для E2E тестов

---

## 📁 Важные Пути

### Frontend
- **Компоненты:** `nero_platform/apps/web/src/components/`
- **Страницы:** `nero_platform/apps/web/src/app/dashboard/`
- **E2E тесты:** `nero_platform/apps/web/e2e/`

### Backend
- **Сервисы:** `nero_platform/services/{service-name}/src/`
- **База данных:** `nero_platform/packages/database/prisma/`

### Конфигурация
- **Docker:** `nero_platform/docker-compose.yml`
- **Root package.json:** `nero_platform/package.json`

---

## 🔧 Команды

### Запуск проекта
```bash
cd nero_platform

# Запустить инфраструктуру (PostgreSQL, Redis, MinIO)
docker-compose up -d postgres redis minio

# Установить зависимости
pnpm install

# Выполнить миграции
pnpm --filter @neiro/database exec prisma migrate deploy

# Запустить все сервисы (в разных терминалах или через PM2)
pnpm --filter @neiro/web dev          # Frontend (3001)
pnpm --filter @neiro/auth dev         # Auth (4001)
pnpm --filter @neiro/analytics dev    # Analytics (4010)
# и т.д.
```

### Тестирование
```bash
# E2E тесты
cd nero_platform/apps/web
pnpm e2e

# Валидация инфраструктуры
pnpm exec tsx scripts/validate-infrastructure.ts
```

### База данных
```bash
# Создать миграцию
pnpm --filter @neiro/database exec prisma migrate dev --name migration_name

# Применить миграции
pnpm --filter @neiro/database exec prisma migrate deploy

# Seed данные
pnpm --filter @neiro/database exec prisma db seed
```

---

## 📊 Customer Journey Map (CJM)

### Месяц 1: Онбординг ✅
- Регистрация/авторизация
- Управление детьми
- Базовый дашборд
- Назначение упражнений

### Месяц 2: Маршруты ✅
- Конструктор маршрутов
- Шаблоны упражнений
- Управление целями
- Назначение маршрутов

### Месяц 3: Аналитика ✅ (95%)
- Analytics Service (статистика прогресса)
- Reports Service (отчеты родителей)
- Notifications Service (уведомления)
- Progress Dashboard (графики)
- MediaUploader (фото/видео)

---

## 🎨 Ключевые Компоненты Month 3

### Analytics (6 компонентов)
1. **LineChart** - график линейной динамики прогресса
2. **PieChart** - круговая диаграмма настроения ребенка
3. **KPICard** - карточка ключевой метрики
4. **ChildStatsCard** - статистика конкретного ребенка
5. **DateRangeFilter** - фильтр временного периода
6. **ProgressHeader** - заголовок страницы прогресса

### Reports (6 компонентов)
1. **MediaUploader** - drag & drop загрузка фото/видео в MinIO
2. **ReviewReportDialog** - диалог отзыва специалиста на отчет
3. **CreateReportDialog** - создание отчета родителем
4. **ReportCard** - карточка отчета
5. **ReportDetailsDialog** - детали отчета
6. **ReviewDialog** - базовый диалог отзыва

### Notifications (2 компонента)
1. **NotificationBell** - колокольчик с badge непрочитанных
2. **NotificationPreferencesDialog** - настройки уведомлений

---

## 🔗 API Endpoints Month 3

### Analytics Service (Port 4010)
```
GET /analytics/v1/children/:childId
GET /analytics/v1/children/:childId/assignments-stats
GET /analytics/v1/children/:childId/goals-progress
GET /analytics/v1/children/:childId/timeline
GET /analytics/v1/routes/:routeId/progress
GET /analytics/v1/specialist/:specialistId
POST /analytics/v1/cache/invalidate
```

### Reports Service (Port 4009)
```
GET /reports/v1
POST /reports/v1
GET /reports/v1/:id
PATCH /reports/v1/:id
```

### Notifications Service (Port 4011)
```
GET /notifications/v1/user
GET /notifications/v1/preferences
PATCH /notifications/v1/preferences
POST /notifications/v1/delivery
```

---

## 🗄️ База Данных

### Основные таблицы
- **users** - пользователи системы
- **children** - профили детей
- **specialists** - профили специалистов
- **routes** - маршруты развития
- **assignments** - назначенные упражнения
- **reports** - отчеты родителей (Month 3)
- **media_assets** - медиа файлы (Month 3)
- **notifications** - уведомления (Month 3)
- **notification_preferences** - настройки уведомлений (Month 3)
- **event_outbox** - очередь событий (Month 3)

### Связи
```
User (1) -> (*) Child (через parent_id)
Child (1) -> (*) Assignment
Assignment (*) -> (1) Exercise
Assignment (1) -> (*) Report (Month 3)
Report (1) -> (*) MediaAsset (Month 3)
User (1) -> (1) NotificationPreferences (Month 3)
```

---

## 🧪 Тестирование

### E2E тесты (104 total)

**Month 1-2 тесты:**
- auth.spec.ts - авторизация
- dashboard.spec.ts - дашборд
- cjm.spec.ts - базовый CJM
- cjm-extended.spec.ts - расширенный CJM
- parent-management.spec.ts - управление родителями

**Month 3 тесты:**
- reports.spec.ts - 4 теста (создание отчета, загрузка медиа, просмотр, отзыв)
- progress.spec.ts - 3 теста (прогресс, графики, фильтры)
- notifications.spec.ts - 3 теста (уведомления, прочтение, настройки)

### Текущий статус
- **51/102 пройдено** (50% pass rate) - требует отладки
- Основные проблемы: таймауты, test-id несовпадения

---

## ⚠️ Известные Проблемы

### Решенные
✅ **Analytics Service tsx resolution** - исправлено использованием абсолютного пути `/app/node_modules/.bin/tsx`

### Активные
⚠️ **E2E тесты** - 50% pass rate, требуется отладка
⚠️ **MinIO buckets** - требуется верификация (Docker был выключен)

---

## 📚 Документация

### Основные документы
- **MONTH_1-3_IMPLEMENTATION_STATUS.md** - детальный статус реализации
- **MONTH_3_FINAL_REPORT.md** - финальный отчет Month 3 (устарел)
- **.cursor/plans/month-3-completion-plan.md** - план завершения Month 3 (устарел)
- **E2E_TESTING_SUMMARY.md** - summary по E2E тестам
- **MONTH_3_API_FIX_REPORT.md** - отчет о фиксе Analytics Service

### Скрипты
- **scripts/validate-infrastructure.ts** - валидация MinIO, Redis, PostgreSQL
- **scripts/create-test-notification.js** - создание тестовых уведомлений

---

## 🚀 Next Steps

### Приоритет 1 (для достижения 100%)
1. Запустить Docker и верифицировать MinIO buckets
2. Отладить E2E тесты (исправить падающие 51 тест)

### Приоритет 2 (улучшения)
1. Обновить устаревшие документы
2. Написать integration тесты для API
3. Performance тестирование Analytics

### Приоритет 3 (будущее)
1. Swagger/OpenAPI документация
2. Мониторинг и алерты
3. CI/CD pipeline

---

## 👥 Git Workflow

### Current branch
```
main
```

### Типичный workflow
```bash
# Создать feature branch
git checkout -b feature/my-feature

# Сделать изменения
git add .
git commit -m "feat: add new feature"

# Push и создать PR
git push -u origin feature/my-feature
gh pr create --title "Add new feature" --body "Description..."
```

---

## 🔍 Полезные Команды

### Поиск по кодовой базе
```bash
# Найти компонент
find nero_platform/apps/web/src/components -name "ComponentName.tsx"

# Найти использование API
grep -r "analytics/v1/children" nero_platform/apps/web/src

# Проверить что сервис запущен
curl http://localhost:4010/health
```

### Docker
```bash
# Проверить запущенные контейнеры
docker ps

# Логи сервиса
docker logs neiro_postgres -f
docker logs neiro_redis -f
docker logs neiro_minio -f

# Проверить MinIO buckets
docker exec -it neiro-minio mc ls local/
```

### Database
```bash
# Prisma Studio (GUI для БД)
pnpm --filter @neiro/database exec prisma studio

# Проверить схему
pnpm --filter @neiro/database exec prisma validate

# Reset DB (осторожно!)
pnpm --filter @neiro/database exec prisma migrate reset
```

---

**Этот документ обновляется автоматически при значительных изменениях проекта.**
