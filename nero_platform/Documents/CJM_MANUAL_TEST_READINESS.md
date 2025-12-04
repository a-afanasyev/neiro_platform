


## 10. Автотесты и CI

### 10.1. Запуск тестов локально

- **Unit/Integration Backend**  
  - Установить зависимости в корне: `pnpm install`.  
  - Запуск всех тестов монорепы: `pnpm test` (под капотом `turbo run test`).  
  - По сервисам:  
    - Auth/Exercises/Templates/Routes/Assignments (Jest): `pnpm --filter @neiro/auth test`, `pnpm --filter @neiro/exercises test` и т.п.  
    - Children/Users (Vitest): `pnpm --filter @neiro/children-service test`, `pnpm --filter @neiro/users-service test`.

- **Frontend E2E (Playwright)**  
  - Перейти в `apps/web`: `cd apps/web`.  
  - Убедиться, что backend и БД запущены (через `docker-compose` и `start-services.sh`).  
  - Запустить тесты: `pnpm test:e2e`.

### 10.2. CI-пайплайн

- В репозитории настроен базовый GitHub Actions workflow: `.github/workflows/ci.yml`.  
- При `push`/`pull_request` в `main` автоматически выполняется:  
  - установка зависимостей через `pnpm install --frozen-lockfile`;  
  - запуск `pnpm test` (unit/integration тесты всех сервисов и пакетов).  
- E2E-тесты Playwright пока запускаются вручную (см. 10.1) и могут быть добавлены в отдельный job CI после стабилизации окружения.

### 10.3. E2E тесты для CJM сценариев

В репозитории реализованы автоматизированные E2E тесты для трех основных Customer Journey Map (CJM) сценариев:

#### CJM #1: Родитель - Первый контакт и онбординг
- **Файл:** `apps/web/e2e/cjm.spec.ts`
- **Покрытие:**
  - Вход родителя в систему после приглашения
  - Просмотр списка своих детей
  - Просмотр профиля ребенка с основной информацией
- **Тестовые данные:** `parent1@example.com / parent123`

#### CJM #2: Родитель - Выполнение программы дома
- **Файл:** `apps/web/e2e/cjm.spec.ts`
- **Покрытие:**
  - Просмотр назначенных упражнений
  - Просмотр календаря занятий
  - Просмотр деталей упражнения
  - Отметка выполнения назначения
- **Тестовые данные:** `parent1@example.com / parent123`

#### CJM #3: Нейропсихолог - Полный цикл сопровождения
- **Файл:** `apps/web/e2e/cjm.spec.ts`
- **Покрытие:**
  - Вход специалиста в систему
  - Просмотр списка закрепленных детей
  - Создание диагностической сессии
  - Просмотр доступных опросников
  - Создание индивидуального маршрута
  - Просмотр существующих маршрутов
  - Создание назначения для ребенка
  - Просмотр библиотеки упражнений
  - Просмотр шаблонов программ
- **Тестовые данные:** `specialist1@example.com / specialist123`

#### Сквозные сценарии
- Полный цикл работы специалиста: от диагностики до назначения упражнений
- Просмотр прогресса выполнения программы родителем

#### Запуск CJM тестов

```bash
# Запуск всех E2E тестов (включая CJM)
cd apps/web
pnpm test:e2e

# Запуск только CJM тестов
cd apps/web
pnpm exec playwright test cjm.spec.ts

# Запуск CJM тестов в UI режиме для отладки
cd apps/web
pnpm exec playwright test cjm.spec.ts --ui

# Запуск конкретного CJM сценария
cd apps/web
pnpm exec playwright test cjm.spec.ts -g "CJM #1"
```

#### Структура CJM тестов

Файл `apps/web/e2e/cjm.spec.ts` содержит:
- **Вспомогательные функции:** `clearStorage()`, `loginAs()`
- **3 основных test suite:** CJM #1, CJM #2, CJM #3
- **Дополнительный suite:** Сквозные сценарии
- **Всего тестов:** 14 автоматизированных сценариев

Все тесты используют тестовые данные из `packages/database/prisma/seed.ts` и не требуют дополнительной настройки окружения.



