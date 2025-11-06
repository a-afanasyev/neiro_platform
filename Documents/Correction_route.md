# Техническое задание: Модуль коррекционного нейропсихологического маршрута

**Версия:** 2.2
**Дата:** 30 октября 2025
**Статус:** синхронизировано с `DATA_MODEL_AND_EVENTS.md` v0.4, включая обновленную схему данных, именование таблиц (множественное число), Constitution Check правила и расширенные доменные события с correlation_id/causation_id.

---

## 1. Назначение и роль модуля

Модуль коррекционного маршрута обеспечивает полный цикл сопровождения ребенка с РАС: от обработки диагностических данных до отслеживания эффективности терапии и работы с шаблонами программ. Он связывает ключевые доменные сервисы платформы Neiro — диагностику, библиотеку упражнений, назначения, коммуникации, аналитику и систему шаблонов.

**Основные цели:**

- построение и сопровождение индивидуальных коррекционных маршрутов, состоящих из фаз, целей, контрольных точек и назначений;
- поддержка адаптивных шаблонов маршрутов и типовых программ для ускорения запуска новых кейсов;
- управление назначениями и каналами выполнения упражнений (очного, домашнего, телепрактики);
- контроль лицензий специалистов и прозрачность работы команды;
- предоставление данных для аналитики, супервизии и управленческих решений.

---

## 2. Ключевые роли и их задачи

- **Нейропсихолог (ведущий специалист)** — принимает результаты диагностики, адаптирует шаблон маршрута, управляет фазами/целями, назначает упражнения, контролирует выполнение и выпускает финальные отчеты.

- **Профильные специалисты (логопед, дефектолог, ABA-терапевт)** — получают назначения, проводят занятия, закрывают контрольные точки, подают отчеты и поддерживают коммуникацию с ведущим специалистом.

- **Методист / контент-куратор** — создает и сопровождает шаблоны маршрутов: формирует черновики, согласует их с супервизорами, публикует версии, отслеживает эффективность и актуализирует содержимое.

- **Администратор / организация** — управляет доступом, отслеживает лицензии специалистов, запускает филиалы, контролирует соответствие требованиям 152-ФЗ/GDPR/HIPAA и аудит контрольных точек.

- **Супервизор** — анализирует данные, проверяет качество маршрутов, дает обратную связь и инициирует корректировки.

- **Родитель / законный представитель** — выполняет домашние задания, отправляет отчеты, получает поддержку и видит прогресс ребенка.

---

## 3. Жизненный цикл маршрута

### 1. Диагностика
- сбор данных через `diagnostic_sessions`;
- автоформирование рекомендаций (`route_recommendations`).

### 2. Инициализация маршрута
- выбор шаблона (`route_templates`) или создание с нуля;
- заполнение базовой информации маршрута (`title`, `summary`, `plan_horizon_weeks`);
- настройка фаз (`route_phases`) и целей (`route_goals`), планирование контрольных точек (`route_phase_milestones`);
- фиксация версии в `route_revision_history`.

### 3. Активация
- перевод маршрута в статус `active`;
- рассылка уведомлений и назначение ответственных специалистов.

### 4. Реализация
- управление назначениями (`assignments`) с указанием канала выполнения (`delivery_channel`) и связей «фаза → упражнение» (`phase_exercises`) и «цель → упражнение» (`goal_exercises`);
- выполнение занятий, подготовка отчетов (`reports`), закрытие вех;
- мониторинг рисков, автонапоминания и коммуникации.

### 5. Коррекция
- внесение изменений на основе данных (повторная диагностика, статус вех, SLA назначений);
- фиксация правок в `route_revision_history`, уведомление команды.

### 6. Оценка эффективности и завершение
- анализ KPI маршрута, сравнение «до/после», подготовка итоговых отчетов;
- решение о продолжении, запуске нового маршрута или архивировании данных.

---

## 4. Структура данных (выдержка)

| Таблица | Назначение | Ключевые поля / связи |
| --- | --- | --- |
| `users` | Пользователи системы | `first_name`, `last_name`, `email`, `phone`, `role`, `status`, `timezone`, `external_id`, `created_at`, `updated_at` |
| `child` | Профили детей | `first_name`, `last_name`, `birth_date`, `gender`, `diagnosis_summary`, `notes`, `archived_at`, `created_at`, `updated_at` |
| `specialist` | Профили специалистов | `user_id`, `specialty`, `license_number`, `license_valid_until`, `experience_years`, `bio`, `created_at`, `updated_at` |
| `exercise` | Библиотека упражнений | `title`, `slug`, `description`, `category`, `age_min`, `age_max`, `difficulty`, `duration_minutes`, `materials` (JSONB), `instructions` (JSONB), `success_criteria` (JSONB), `media_assets` (JSONB), `created_at`, `updated_at` |
| `children_parents` | Связь ребенок–родитель | `child_id`, `parent_user_id`, `legal_guardian`, `relationship`, `guardianship_type`, `invited_at`, `linked_at` |
| `children_specialists` | Команда специалистов | `child_id`, `specialist_id`, `specialization`, `is_primary`, `assigned_at`, `released_at`, `role_description` |
| `diagnostic_sessions` | Диагностические сессии | `child_id`, `performed_by`, `questionnaire_code`, `started_at`, `completed_at`, `status`, `score_total`, `score_raw` (JSONB), `interpretation_level`, `notes` |
| `diagnostic_session_results` | Результаты диагностики | `session_id`, `answers` (JSONB), `scoring` (JSONB), `risk_flags` (JSONB) |
| `route` | Корневые объекты маршрутов | `child_id`, `lead_specialist_id`, `template_id`, `active_version_id`, `baseline_snapshot_id`, `title`, `summary`, `status`, `plan_horizon_weeks`, `start_date`, `end_date`, `created_at`, `updated_at` |
| `route_goals` | Цели развития | `route_id`, `phase_id`, `category`, `goal_type`, `description`, `target_metric`, `measurement_unit`, `baseline_value`, `target_value`, `review_period_weeks`, `priority`, `status`, `created_at`, `updated_at` |
| `route_phases` | Фазы маршрута | `route_id`, `responsible_specialist_id`, `name`, `description`, `order_index`, `parallel_group`, `status`, `start_date`, `end_date`, `duration_weeks`, `expected_outcomes`, `notes`, `created_at`, `updated_at` |
| `route_phase_milestones` | Контрольные точки фаз | `phase_id`, `goal_id`, `title`, `description`, `checkpoint_type`, `due_week`, `success_criteria`, `status`, `completed_at`, `evidence_links` (JSONB) |
| `phase_exercises` | Связь «фаза–упражнение» | `phase_id`, `exercise_id`, `order_index`, `frequency_per_week`, `duration_minutes`, `notes`, `is_mandatory` |
| `goal_exercises` | Связь «цель–упражнение» | `goal_id`, `exercise_id`, `contribution_level` ('primary' \| 'supporting'), `notes` |
| `assignments` | Назначения упражнений | `child_id`, `exercise_id`, `assigned_by_id`, `route_id`, `phase_id`, `target_goal_id`, `assigned_at`, `planned_start_date`, `due_date`, `status`, `delivery_channel`, `notes`, `frequency_per_week`, `expected_duration_minutes`, `reminder_policy` (JSONB) |
| `reports` | Отчеты о выполнении | `assignment_id`, `parent_id`, `reviewed_by`, `submitted_at`, `status`, `duration_minutes`, `child_mood`, `feedback_text`, `media` (JSONB), `auto_score`, `reviewed_at`, `review_status` |
| `assignment_history` | История назначений (аудит) | `assignment_id`, `changed_by`, `event_type`, `from_status`, `to_status`, `changed_at`, `metadata` (JSONB) |
| `report_reviews` | Комментарии к отчетам | `report_id`, `reviewer_id`, `review_status`, `notes`, `created_at` |
| `route_templates` | Шаблоны маршрутов | `title`, `description`, `target_age_range`, `severity_level`, `version`, `status`, `created_at`, `updated_at`, `published_at` |
| `template_phases` | Фазы шаблонов | `template_id`, `name`, `description`, `order_index`, `duration_weeks`, `specialty_hint`, `notes` |
| `template_goals` | Цели шаблонов | `template_id`, `template_phase_id`, `category`, `goal_type`, `description`, `target_metric`, `measurement_unit`, `baseline_guideline`, `target_guideline`, `priority`, `notes` |
| `template_milestones` | Вехи шаблонов | `template_phase_id`, `title`, `description`, `checkpoint_type`, `due_week`, `success_criteria` |
| `template_exercises` | Связь шаблон–упражнение | `template_phase_id`, `exercise_id`, `template_goal_id`, `order_index`, `frequency_per_week`, `duration_minutes`, `notes` |
| `route_revision_history` | Версионирование маршрутов | `route_id`, `version`, `payload` (JSONB), `changed_by`, `changed_at`, `change_reason` |
| `route_recommendations` | Автогенерация целей | `session_id`, `goal_stub` (JSONB), `confidence`, `created_at` |
| `media_assets` | Медиа-ресурсы | `owner_type`, `owner_id`, `media_type`, `path`, `checksum`, `created_at`, `expires_at` |
| `notifications` | Уведомления | `channel`, `payload` (JSONB), `status`, `attempts`, `scheduled_at`, `sent_at`, `created_at` |
| `event_outbox` | Outbox Pattern для событий | `event_name`, `aggregate_type`, `aggregate_id`, `payload` (JSONB), `created_at`, `published_at`, `status` |
| `event_outbox_failures` | DLQ для неуспешных публикаций | `original_outbox_id`, `payload` (JSONB), `error_summary`, `retry_count`, `failed_at`, `reprocessed_at` |

Полная ERD приводится в `DATA_MODEL_AND_EVENTS.md`.

---

## 5. Основные процессы

### 5.1 Создание и запуск маршрута

1. Нейропсихолог выбирает шаблон или стартует пустой маршрут.
2. Система подтягивает преднастроенные фазы, цели, вехи и упражнения (при наличии шаблона).
3. Специалист корректирует структуру: удаляет/добавляет фазы, настраивает `order_index`, `parallel_group`, связывает упражнения с целями.
4. Заполняется базовая версия с указанием `title`, `summary`, `plan_horizon_weeks`, `start_date`, `end_date`, сохраняется в `route_revision_history`.
5. После проверки (при необходимости супервизором) маршрут активируется, в команду добавляются ответственные специалисты (`children_specialists`).

### 5.2 Управление шаблонами (методист)

1. Методист анализирует статистику и фидбек (CJM #8a).
2. Создает или обновляет шаблон в статусе `draft`, используя модульные блоки.
3. Отправляет на рецензию супервизору; комментарии фиксируются в журнале версий.
4. Публикует шаблон (`templates.template.published`), система уведомляет специалистов.
5. Периодически пересматривает KPI шаблона, выпускает новую версию (`templates.template.updated`). Архивирование (`templates.template.archived`) запрещает использование в новых кейсах, но сохраняет связь с историческими маршрутами.

### 5.3 Управление назначениями и каналами

- При создании `assignments` нейропсихолог задает канал выполнения (`in_person`, `home`, `telepractice`), плановую дату старта (`planned_start_date`), срок выполнения (`due_date`), частоту (`frequency_per_week`) и ожидаемую продолжительность (`expected_duration_minutes`).
- Система проверяет отсутствие конфликтов расписания и уникальность активных назначений для пары «ребенок + упражнение + фаза».
- Родители/специалисты получают уведомления через Email/SMS/Push/Telegram (`comms.notification.sent`).
- Просрочка или отмена фиксируется событиями `assignments.assignment.overdue` / `assignments.assignment.cancelled`.

### 5.4 Контрольные точки и мониторинг

- Вехи задаются для фаз, имеют сроки (`due_week`) и требования к доказательствам.
- Исполнители закрывают вехи, прикрепляя медиа; система валидирует completeness.
- Супервизор отслеживает прогресс через дашборд, может вернуть веху на доработку.
- Событие `routes.milestone.completed` обновляет аналитические витрины.

### 5.5 Управление лицензиями и соответствием

- Администратор поддерживает актуальный список лицензий в `specialist`.
- Система шлет напоминания за 30/7/3 дня до истечения (`comms.notification.sent` + сценарий CJM #6).
- При просрочке доступ к созданию новых маршрутов/назначений блокируется (`auth.user.suspended` или бизнес-ограничение).

### 5.6 Отчётность и аналитика

- Авторасчеты прогресса по целям, сравнение «до/после», визуализация в дашбордах.
- Генерация снапшотов (`analytics.dashboard.snapshot_generated`) для супервизии и управленческой отчетности.
- Экспорт маршрутов и отчетов доступен в форматах PDF/CSV, с сохранением истории версий.
- Отчеты включают автоматическую оценку (`auto_score`) и статус проверки (`review_status`).

---

## 6. Constitution Check: Бизнес-ограничения целостности

Модуль обязан соблюдать следующие инварианты (`DATA_MODEL_AND_EVENTS.md`, §4):

1. **Фаза без маршрута недопустима** — нельзя создать фазу без привязки к существующему маршруту; `route_phases.route_id` обязательно (Foreign Key constraint).

2. **Упражнение не должно «висеть» вне фазы** — все упражнения маршрута привязаны к конкретным фазам через `phase_exercises`.

3. **Цель не может существовать без маршрута** — каждая цель развития должна быть привязана к маршруту; `route_goals.route_id` обязательно (NOT NULL + Foreign Key).

4. **Назначение только в контексте маршрута** — нельзя назначить ребенку упражнение без активного маршрута; при создании `assignments` указывается `phase_id`.

5. **Упражнение должно быть связано с целью** — каждое упражнение в маршруте должно способствовать достижению целей (проверка через `goal_exercises`).

6. **Нельзя активировать пустой маршрут** — маршрут можно перевести из 'draft' в 'active' только если он содержит ≥1 фазу, ≥1 цель и каждая фаза содержит ≥1 упражнение.

7. **Единственный активный маршрут на ребенка** — у одного ребенка может быть только один активный маршрут одновременно (`UNIQUE INDEX uniq_active_route_per_child ON route(child_id) WHERE status = 'active'`).

8. **Уникальность и порядок фаз** — порядок фаз должен быть уникальным в пределах маршрута; `route_phases.order_index` уникален для каждого `route_id` (`UNIQUE(route_id, order_index)`).

9. **Целостность при редактировании маршрута** — при внесении изменений в активный маршрут сохраняется история версий в `route_revision_history` перед применением изменений.

10. **Валидация ссылок на справочники** — все внешние ключи должны ссылаться на существующие сущности; `lead_specialist_id` → специалист с действующей лицензией (`license_valid_until >= CURRENT_DATE`).

---

## 7. Интеграции и доменные события

Модуль публикует и потребляет события (см. `DATA_MODEL_AND_EVENTS.md`, §2).

### Обязательные мета-поля событий

Все события содержат следующие поля для трассируемости:
- `event_id` (UUID v7) — уникальный идентификатор события
- `event_name` — полное имя события (module.aggregate.event)
- `schema_version` — версия схемы события
- `timestamp` — ISO 8601 timestamp
- `correlation_id` — UUID запроса пользователя (прослеживается через весь flow)
- `causation_id` — event_id события-причины (какое событие вызвало данное)
- `actor_id` — UUID пользователя/системы, инициировавшего действие
- `actor_type` — тип актора ('user' | 'specialist' | 'system' | 'parent')
- `payload` — бизнес-данные события

### События модуля

**Сервис `route-orchestrator`:**
- `routes.route.created`, `routes.route.activated`, `routes.route.updated`, `routes.route.completed`
- `routes.goal.status_changed`, `routes.goal.exercise_linked`
- `routes.phase.created`, `routes.phase.status_changed`, `routes.milestone.completed`
- `routes.template.applied`

**Сервис `templates`:**
- `templates.template.published`, `templates.template.updated`, `templates.template.archived`
- `templates.template.exercise_updated`

**Сервис `assignments`:**
- `assignments.assignment.created`, `assignments.assignment.status_changed`
- `assignments.assignment.overdue`, `assignments.assignment.cancelled`

**Сервис `reports`:**
- `reports.report.submitted`, `reports.report.reviewed`
- `reports.media.attached`

**Потребляемые события:**
- `auth.user.invited`, `auth.user.activated`, `auth.user.suspended`
- `diagnostics.session.completed`, `diagnostics.recommendations.generated`
- `exercises.exercise.published`, `exercises.exercise.retired`
- `comms.notification.sent`, `comms.notification.failed`
- `analytics.dashboard.snapshot_generated`

### API контракты

API-эндпоинты описаны в `API_CONTRACTS_MVP.md`:
- `/routes/v1` — CRUD операции над маршрутами, активация/пауза/завершение
- `/templates/v1` — управление шаблонами маршрутов
- `/assignments/v1` — управление назначениями упражнений
- `/milestones/v1` — контрольные точки и вехи
- `/licensing/v1` — управление лицензиями специалистов
- `/reports/v1` — управление отчетами о выполнении
- `/children/v1` — управление профилями детей

Реализация обязана поддерживать версионирование (v1) и спецификации OpenAPI 3.1.

---

## 7. UX и пользовательские сценарии

Дизайн и CJM определяют требования:

- онбординг родителя (CJM #1), выполнение домашних заданий (CJM #2);
- полный цикл нейропсихолога (CJM #3) с планированием каналов и версионированием маршрута;
- работа профильных специалистов и закрытие вех (CJM #4);
- супервизия и аудит качества (CJM #5);
- администрирование, лицензии и аудит контрольных точек (CJM #6);
- управление шаблонами методистом (CJM #8a).

Интерфейсы должны реализовать: конструктор маршрута, панель шаблонов, дашборды по вехам и назначениям, модуль контроля лицензий и настройки уведомлений.

---

## 8. Требования к качеству и приёмке

- Функциональные кейсы покрывают создание, активацию, исполнение, корректировку и закрытие маршрутов, включая шаблоны, вехи, назначения, отчеты и аналитику.
- Все создаваемые/изменяемые записи соответствуют ограничениям БД (уникальности, ссылочная целостность, обязательные связи).
- События публикуются с актуальными payload и `schema_version`, проходят контрактные тесты.
- API соответствует спецификациям `API_CONTRACTS_MVP.md`; предусмотрены тесты для edge-кейсов (параллельные фазы, просроченные лицензии, отмены назначений).
- UI/UX реализует состояния, описанные в `DESIGN_SYSTEM.md` и `UI_KIT.md`, включая ошибки, загрузку, пустые экраны и адаптивность.
- Соответствие данным и процессам `DATA_GOVERNANCE.md`: управление персональными и медицинскими данными, журналы аудита, SLA уведомлений.
- Поддержка всех JSONB полей с валидацией по JSON-схемам, указанным в `DATA_MODEL_AND_EVENTS.md`.

---

## 9. Связанные документы

- `DATA_MODEL_AND_EVENTS.md` — формальное описание сущностей и доменных событий.
- `API_CONTRACTS_MVP.md` — REST/tRPC контракты.
- `Neiro_CJM_Extended.md` — сценарии UX и роли.
- `DESIGN_SYSTEM.md`, `UI_KIT.md` — дизайн-система и паттерны интерфейсов.
- `DATA_GOVERNANCE.md` — политика обработки данных и регламенты.
- `ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md` — общеплатформенное ТЗ.

**Примечание:** Документ синхронизирован с `DATA_MODEL_AND_EVENTS.md` v0.4, включая обновленную схему данных, именование таблиц (единственное число), Constitution Check правила и расширенные доменные события с correlation_id/causation_id и outbox-инфраструктуру с DLQ.

Документ является живым: обновления фиксируются при изменении схемы данных, событий либо пользовательских сценариев.
