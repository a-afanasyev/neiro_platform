# Neiro Platform — Data Model & Domain Events

**Версия:** 0.2
**Дата:** 28 октября 2025
**Назначение:** нормативное описание ключевых сущностей MVP и каталога доменных событий, удовлетворяющего требованиям `constitution.md` (Stack Compliance, Service Boundaries, API Contract, Events, Data Policy).

**Изменения в версии 0.2:**
- Добавлена Section 3: SQL DDL Migrations с полными CREATE TABLE для всех 27 таблиц
- Добавлена Section 4: Constitution Check с 10 систематизированными бизнес-правилами
- Расширены описания полей сущностей с типами данных и ограничениями
- Добавлены JSON-схемы для JSONB-полей
- Обогащены события: correlation_id, causation_id, actor_id в payload

---

## 1. Entity Relationship Overview (Textual ERD)

> В ERD отражены сущности MVP и расширенного модуля маршрутов: пользователи, специалисты, дети, диагностики, маршруты, фазы, цели, упражнения, назначения, отчеты, а также шаблонный слой и связи «фаза/цель ↔ упражнение». Вспомогательные справочники (аудит, уведомления и т.п.) перечислены отдельно и следуют ограничениям конституции проекта.

### 1.1 Пользователь (`users`)
- **Primary Key:** `id UUID`.
- **Unique:** `email`, `external_id` (если задан).
- **Полям:** `first_name`, `last_name`, `email`, `phone`, `role` (`parent | specialist | supervisor | admin`), `status` (`active | suspended | invited`), `timezone`, `created_at`, `updated_at`.
- **Связи:**
  - `users` (1) ↔ (N) `children_parents` через `parent_user_id`.
  - `users` (1) ↔ (N) `children_specialists` через `user_id` (роль `specialist`).
  - `users` (1) ↔ (N) `assignments` через `assigned_by_id` (для специалистов) и `changed_by` (история).
  - `users` (1) ↔ (N) `reports` как `parent_id`.
  - `users` (1) ↔ (N) `diagnostic_sessions` как `performed_by`.
- **Ограничения:** `role` проверяется CHECK; при `status = suspended` запрещены новые сессии/назначения (прикладной уровень).

### 1.2 Профиль специалиста (`specialists`)
- **Primary Key:** `id UUID` (совпадает с `users.id` для ролей `specialist`/`supervisor`).
- **Foreign Keys:** `user_id → users.id`.
- **Полям:** `specialty` (`neuropsychologist | speech_therapist | aba | occupational | supervisor | other`), `license_number`, `license_valid_until`, `experience_years`, `bio`.
- **Связи:**
  - `specialists` (1) ↔ (N) `correction_routes` через `lead_specialist_id`.
  - `specialists` (1) ↔ (N) `route_phases` через `responsible_specialist_id`.
  - `specialists` (1) ↔ (N) `assignments` как `assigned_by_id`.
  - `specialists` (1) ↔ (N) `route_revision_history` как `changed_by`.
- **Ограничения:** запись в `specialists` обязательна для каждого пользователя с ролью `specialist` или `supervisor`; при отсутствии действующей лицензии невозможен выпуск новых маршрутов (прикладной контроль).

### 1.3 Ребенок (`children`)
- **Primary Key:** `id UUID`.
- **Полям:** `first_name`, `last_name`, `birth_date`, `gender`, `diagnosis_summary`, `notes`, `created_at`, `updated_at`.
- **Связи:**
  - `children` (1) ↔ (N) `children_parents` (многие родители).
  - `children` (1) ↔ (N) `children_specialists` (активные специалисты).
  - `children` (1) ↔ (N) `diagnostic_sessions`.
  - `children` (1) ↔ (N) `correction_routes`.
  - `children` (1) ↔ (N) `assignments`.
  - `children` (1) ↔ (N) `reports`.
- **Ограничения:** возраст вычисляется на клиенте; soft-delete через `archived_at`.

### 1.4 Связь «ребенок — родитель» (`children_parents`)
- **Primary Key:** `id UUID`.
- **Unique:** `(child_id, parent_user_id)`; `guardianship_type`.
- **Foreign Keys:** `child_id → children.id` (ON DELETE CASCADE), `parent_user_id → users.id`.
- **Полям:** `legal_guardian` (bool), `relationship` (enum), `invited_at`, `linked_at`.
- **Назначение:** позволяет нескольким родителям иметь доступ к профилю.

### 1.5 Связь «ребенок — специалист» (`children_specialists`)
- **Primary Key:** `id UUID`.
- **Unique:** `(child_id, specialist_id, specialization)`.
- **Foreign Keys:** `child_id → children.id`, `specialist_id → specialists.id`.
- **Полям:** `specialization` (`lead | speech | aba | occupational | supervisor | other`), `is_primary` (bool), `assigned_at`, `released_at`, `role_description`.
- **Назначение:** хранит текущую команду специалиста; запись обязательна для действующего `lead_specialist_id` маршрута.

### 1.6 Диагностический сеанс (`diagnostic_sessions`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `child_id → children.id`, `performed_by → users.id`.
- **Полям:** `questionnaire_code`, `started_at`, `completed_at`, `status` (`draft | in_progress | completed | cancelled`), `score_total`, `score_raw`, `interpretation_level`, `notes`.
- **Дополнительно:** структура ответов и исходные данные лежат в `diagnostic_session_results`.
- **Связи:**
  - `diagnostic_sessions` (1) ↔ (1) `diagnostic_session_results` (JSON ответов).
  - `diagnostic_sessions` (1) ↔ (N) `route_recommendations` (первые цели маршрута).
- **Ограничения:** `completed_at` NOT NULL when `status = 'completed'`.

### 1.7 Результаты диагностики (`diagnostic_session_results`)
- **Primary Key / Foreign Key:** `session_id → diagnostic_sessions.id`.
- **Полям:** `answers JSONB`, `scoring JSONB`, `risk_flags JSONB`.
- **Назначение:** хранит детальные ответы, обеспечивая денормализацию основной таблицы.

### 1.8 Коррекционный маршрут (`correction_routes`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `child_id → children.id`, `lead_specialist_id → specialists.id`, `template_id → route_templates.id` (nullable), `active_version_id → route_revision_history.id` (nullable).
- **Полям:** `title`, `summary`, `status` (`draft | active | paused | completed | archived`), `plan_horizon_weeks`, `start_date`, `end_date`, `created_at`, `updated_at`, `baseline_snapshot_id`.
- **Связи:**
  - `correction_routes` (1) ↔ (N) `route_goals`.
  - `correction_routes` (1) ↔ (N) `route_phases`.
  - `correction_routes` (1) ↔ (N) `phase_exercises` (через `route_phases`).
  - `correction_routes` (1) ↔ (N) `assignments` (через `route_id`).
  - `correction_routes` (1) ↔ (N) `route_revision_history`.
  - `correction_routes` (N) ↔ (1) `route_templates` (по `template_id`).
- **Ограничения:**
  - один активный маршрут на ребенка (`UNIQUE(child_id) WHERE status IN ('active')`);
  - `template_id` меняется только при создании новой версии маршрута;
  - `lead_specialist_id` должен ссылаться на действующего специалиста (`specialists.valid_until >= current_date`).

### 1.9 Цели маршрута (`route_goals`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `route_id → correction_routes.id`, `phase_id → route_phases.id` (nullable, если цель охватывает весь маршрут).
- **Полям:** `category`, `goal_type` (`skill | behaviour | academic | other`), `description`, `target_metric`, `measurement_unit`, `baseline_value`, `target_value`, `review_period_weeks`, `priority` (`high | medium | low`), `status`, `created_at`, `updated_at`.
- **Связи:** `route_goals` (1) ↔ (N) `goal_exercises`.
- **Ограничения:**
  - активная цель обязана иметь ≥1 связанное упражнение (через `goal_exercises`);
  - `phase_id` обязателен, если цель относится к конкретной фазе;
  - пересмотр цели фиксируется в `route_revision_history`.

### 1.10 Фазы маршрута (`route_phases`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `route_id → correction_routes.id`, `responsible_specialist_id → specialists.id`.
- **Полям:** `name`, `description`, `order_index`, `parallel_group`, `status` (`planned | active | on_hold | completed`), `start_date`, `end_date`, `duration_weeks`, `expected_outcomes`, `notes`.
- **Связи:**
  - `route_phases` (1) ↔ (N) `route_phase_milestones`.
  - `route_phases` (1) ↔ (N) `phase_exercises`.
  - `route_phases` (1) ↔ (N) `assignments` (через `phase_id`).
- **Ограничения:**
  - `order_index` уникален в рамках `route_id` для последовательных фаз;
  - параллельные фазы объединяются `parallel_group`, при этом для каждой группы требуется отдельный `responsible_specialist_id`;
  - фаза не может перейти в `completed`, пока не закрыты все связанные вехи и назначения.

### 1.11 Контрольные точки фазы (`route_phase_milestones`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `phase_id → route_phases.id`, `goal_id → route_goals.id` (nullable).
- **Полям:** `title`, `description`, `checkpoint_type` (`assessment | observation | meeting`), `due_week`, `success_criteria`, `status` (`planned | due | completed | overdue`), `completed_at`, `evidence_links JSONB`.
- **Ограничения:**
  - `due_week` ≥ 1 и ≤ `route_phases.duration_weeks`;
  - переход в `completed` требует фиксации исполнителя и приложенных артефактов.

### 1.12 Связь «фаза — упражнение» (`phase_exercises`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `phase_id → route_phases.id`, `exercise_id → exercises.id`.
- **Полям:** `order_index`, `frequency_per_week`, `duration_minutes`, `notes`, `is_mandatory` (bool).
- **Ограничения:**
  - `order_index` уникален в рамках `phase_id`;
  - связь не может быть удалена, если по упражнению уже есть активные назначения.

### 1.13 Связь «цель — упражнение» (`goal_exercises`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `goal_id → route_goals.id`, `exercise_id → exercises.id`.
- **Полям:** `contribution_level` (`primary | supporting`), `notes`.
- **Ограничения:**
  - каждая запись валидируется на принадлежность `exercise_id` к фазам того же маршрута (прикладной уровень);
  - при удалении цели все связи каскадно удаляются.

### 1.14 Шаблон маршрута (`route_templates`)
- **Primary Key:** `id UUID`.
- **Полям:** `title`, `description`, `target_age_range`, `severity_level`, `version`, `status` (`draft | published | archived`), `created_at`, `updated_at`, `published_at`.
- **Связи:**
  - `route_templates` (1) ↔ (N) `template_phases`.
  - `route_templates` (1) ↔ (N) `template_goals`.
  - `route_templates` (1) ↔ (N) `template_milestones` (через фазы).
  - `route_templates` (1) ↔ (N) `correction_routes` (через `template_id`).
- **Ограничения:** версия увеличивается при каждом опубликованном изменении; только одна версия в статусе `published` одновременно.

### 1.15 Фаза шаблона (`template_phases`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `template_id → route_templates.id`.
- **Полям:** `name`, `description`, `order_index`, `duration_weeks`, `specialty_hint`, `notes`.
- **Связи:** `template_phases` (1) ↔ (N) `template_milestones`; `template_phases` (1) ↔ (N) `template_exercises`.
- **Ограничения:** `order_index` уникален в рамках шаблона.

### 1.16 Цель шаблона (`template_goals`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `template_id → route_templates.id`, `template_phase_id → template_phases.id` (nullable).
- **Полям:** `category`, `goal_type`, `description`, `target_metric`, `measurement_unit`, `baseline_guideline`, `target_guideline`, `priority`, `notes`.
- **Ограничения:** каждая опубликованная цель должна иметь рекомендацию по упражнениям (через `template_exercises`).

### 1.17 Контрольные точки шаблона (`template_milestones`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `template_phase_id → template_phases.id`.
- **Полям:** `title`, `description`, `checkpoint_type`, `due_week`, `success_criteria`.

### 1.18 Связь «шаблон — упражнение» (`template_exercises`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `template_phase_id → template_phases.id`, `exercise_id → exercises.id`, `template_goal_id → template_goals.id` (nullable).
- **Полям:** `order_index`, `frequency_per_week`, `duration_minutes`, `notes`.
- **Ограничения:** валидируется принадлежность упражнений к релевантным целям; связь используется для авто-генерации маршрута.

### 1.19 Упражнение (`exercises`)
- **Primary Key:** `id UUID`.
- **Полям:** `title`, `slug`, `category`, `age_min`, `age_max`, `difficulty`, `duration_minutes`, `materials JSONB`, `instructions JSONB`, `success_criteria JSONB`, `media_assets JSONB`, `created_at`, `updated_at`.
- **Связи:** `exercises` (1) ↔ (N) `assignments`.
- **Ограничения:** `slug` уникален; A/B-версии фиксируются через `exercise_variants`.

### 1.20 Назначение (`assignments`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `child_id → children.id`, `exercise_id → exercises.id`, `assigned_by_id → specialists.id`, `route_id → correction_routes.id`, `phase_id → route_phases.id`, `target_goal_id → route_goals.id` (nullable).
- **Полям:** `assigned_at`, `planned_start_date`, `due_date`, `status` (`assigned | in_progress | completed | overdue | cancelled`), `delivery_channel` (`in_person | home | telepractice`), `notes`, `frequency_per_week`, `expected_duration_minutes`, `reminder_policy JSONB`.
- **Связи:** `assignments` (1) ↔ (N) `reports`.
- **Ограничения:**
  - `phase_id` обязателен; `phase_id.route_id` и `route_id` должны совпадать;
  - `child_id` должен совпадать с `correction_routes.child_id` и `route_phases.route.child_id` (проверка на уровне БД через CHECK/триггер);
  - активные назначения уникальны по `(child_id, exercise_id, phase_id, status)` для статусов `assigned` и `in_progress`;
  - при переводе в `completed` требуется наличие хотя бы одного отчета или отметки специалиста о выполнении.

### 1.21 Отчет (`reports`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `assignment_id → assignments.id`, `parent_id → users.id`, `reviewed_by → specialists.id` (nullable).
- **Полям:** `submitted_at`, `status` (`completed | partial | failed`), `duration_minutes`, `child_mood`, `feedback_text`, `media JSONB`, `auto_score`, `reviewed_at`, `review_status` (`not_reviewed | approved | needs_attention | rejected`).
- **Связи:** `reports` (1) ↔ (N) `report_reviews` (заметки специалистов).
- **Ограничения:**
  - не более одного отчета в день по назначению (`UNIQUE(assignment_id, report_date)`);
  - при статусе `approved` поле `reviewed_by` обязательно.

### 1.22 История назначений (`assignment_history`)
- **Primary Key:** `id UUID`.
- **Foreign Keys:** `assignment_id → assignments.id`, `changed_by → users.id`.
- **Полям:** `event_type` (`status_change | reassigned | cancelled`), `from_status`, `to_status`, `changed_at`, `metadata JSONB`.
- **Назначение:** аудит и ретроспектива, выполняет требования Data Policy; хранит полную трассировку изменений по требованиям HIPAA/GDPR.

### 1.23 Поддерживающие таблицы
- **`route_revision_history`** — версии маршрута (`id`, `route_id`, `version`, `payload JSONB`, `changed_by → specialists.id`, `changed_at`, `change_reason`).
- **`route_recommendations`** — предложения по целям из диагностики (`id`, `session_id`, `goal_stub JSONB`, `confidence`, `created_at`).
- **`report_reviews`** — комментарии специалистов к отчетам (`id`, `report_id`, `reviewer_id`, `review_status`, `notes`, `created_at`).
- **`media_assets`** — хранит presigned-данные для MinIO (`id`, `owner_type`, `owner_id`, `media_type`, `path`, `checksum`, `created_at`, `expires_at`).
- **`notifications`** — очередь уведомлений для comms (`id`, `channel`, `payload`, `status`, `attempts`, `scheduled_at`).
- **`event_outbox`** — outbox-шаблон на каждый сервис с transactional-подъемом событий (см. раздел 2).

---

## 2. Доменные события

### Нотация и общие правила
- **Именование:** `<module>.<aggregate>.<event>` в `snake_case`, например `diagnostics.session.completed`.
- **Версионирование:** поле `schema_version` (integer). При несовместимых изменениях создаём новую версию события.
- **Transport:** публикация в Redis Streams/Kafka (конкретный брокер уточняется DevOps), формат JSON.
- **Соответствие constitution:** каждый сервис имеет outbox и отвечает за публикацию собственных событий. Подписчики не пишут обратно в источник напрямую.

### Обязательные поля в каждом событии
Все события должны содержать следующие мета-поля для обеспечения трассируемости:

```typescript
interface BaseEvent {
  event_id: string;           // UUID v7 уникального события
  event_name: string;          // Полное имя события (module.aggregate.event)
  schema_version: number;      // Версия схемы события
  timestamp: string;           // ISO 8601 timestamp
  correlation_id: string;      // UUID запроса пользователя (прослеживается через весь flow)
  causation_id: string;        // event_id события-причины (какое событие вызвало данное)
  actor_id: string;            // UUID пользователя/системы, инициировавшего действие
  actor_type: string;          // Тип актора: 'user', 'specialist', 'system', 'parent'
  payload: object;             // Бизнес-данные события
}
```

**Пример использования:**
- Пользователь создаёт маршрут (correlation_id = request_id)
- Система публикует `routes.route.created` (causation_id = null, т.к. первое событие)
- При активации маршрута публикуется `routes.route.activated` (causation_id = event_id из routes.route.created)
- Последующие `assignments.assignment.created` имеют causation_id = event_id из routes.route.activated

### 2.1 Сервис `auth`
| Event | Payload (JSON Schema, short) | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `auth.user.invited` | `{ schema_version, user_id, email, role, invited_at }` | При создании приглашения через админку | `comms` (email/sms), `analytics` |
| `auth.user.activated` | `{ schema_version, user_id, activated_at, role }` | После подтверждения регистрации | `diagnostics` (инициализация опросов), `route-orchestrator`, `analytics` |
| `auth.user.role_changed` | `{ schema_version, user_id, previous_role, new_role, changed_at, changed_by }` | Изменение роли администраторами | `access-control` (если выделим), `analytics` |
| `auth.user.suspended` | `{ schema_version, user_id, reason, suspended_at }` | Блокировка аккаунта | `comms` (уведомить), `assignments` (поставить на hold), `analytics` |

### 2.2 Сервис `diagnostics`
| Event | Payload | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `diagnostics.session.started` | `{ schema_version, session_id, child_id, questionnaire_code, started_at, specialist_id }` | Начало прохождения опросника | `analytics`, `route-orchestrator` (чтобы резервация маршрута) |
| `diagnostics.session.completed` | `{ schema_version, session_id, child_id, questionnaire_code, score_total, interpretation_level, completed_at, specialist_id }` | Завершение опроса с подсчетом | `route-orchestrator` (генерация рекомендаций), `reports`, `analytics`, `comms` (уведомляет родителей) |
| `diagnostics.session.cancelled` | `{ schema_version, session_id, child_id, cancelled_at, reason }` | Прерывание сессии | `analytics`, `comms` |
| `diagnostics.recommendations.generated` | `{ schema_version, session_id, child_id, recommendations: Goal[] }` | Когда сервис сформировал цели маршрута | `route-orchestrator` (инициализация черновика), `analytics` |

### 2.3 Сервис `route-orchestrator`
| Event | Payload | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `routes.route.created` | `{ schema_version, route_id, child_id, lead_specialist_id, status, template_id, created_at }` | Создание черновика вручную или из шаблона | `analytics`, `comms`, `templates` |
| `routes.route.activated` | `{ schema_version, route_id, child_id, activated_at, lead_specialist_id }` | Запуск маршрута | `assignments`, `analytics`, `comms` |
| `routes.route.updated` | `{ schema_version, route_id, child_id, updated_at, changed_fields, version_id }` | Изменение ключевых полей (цели, фазы, специалисты) | `assignments`, `reports`, `analytics` |
| `routes.route.completed` | `{ schema_version, route_id, child_id, completed_at, outcome_summary }` | Завершение | `analytics`, `comms`, `reports` |
| `routes.goal.status_changed` | `{ schema_version, route_id, goal_id, status, changed_at, specialist_id }` | Изменение статуса цели | `analytics`, `reports` |
| `routes.goal.exercise_linked` | `{ schema_version, route_id, goal_id, exercise_id, linked_at, specialist_id }` | Упражнение привязано/отвязано к цели | `analytics`, `assignments` |
| `routes.phase.created` | `{ schema_version, phase_id, route_id, name, order_index, parallel_group, responsible_specialist_id, created_at }` | Добавлена новая фаза | `assignments`, `analytics`, `comms` |
| `routes.phase.status_changed` | `{ schema_version, phase_id, route_id, from_status, to_status, changed_at, specialist_id }` | Смена статуса фазы | `analytics`, `assignments` |
| `routes.milestone.completed` | `{ schema_version, milestone_id, phase_id, route_id, completed_at, specialist_id }` | Закрытие контрольной точки | `analytics`, `reports` |
| `routes.template.applied` | `{ schema_version, route_id, template_id, version, applied_at, applied_by }` | Маршрут создан или обновлен по шаблону | `analytics`, `templates` |

### 2.4 Сервис `exercises`
| Event | Payload | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `exercises.exercise.published` | `{ schema_version, exercise_id, slug, category, difficulty, published_at }` | Доступность упражнения | `assignments`, `analytics`, `templates`, `comms` (новинки) |
| `exercises.exercise.updated` | `{ schema_version, exercise_id, updated_fields, updated_at }` | Существенные изменения | `assignments` (валидировать активные назначения), `analytics`, `templates` |
| `exercises.exercise.retired` | `{ schema_version, exercise_id, retired_at, reason }` | Снятие с публикации | `assignments` (вынести из планов), `analytics`, `templates`, `comms` |

### 2.5 Сервис `assignments`
| Event | Payload | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `assignments.assignment.created` | `{ schema_version, assignment_id, child_id, exercise_id, assigned_by_id, planned_start_date, due_date, status, route_id, phase_id, target_goal_id }` | Создано новое назначение | `comms` (уведомления), `reports`, `analytics` |
| `assignments.assignment.status_changed` | `{ schema_version, assignment_id, child_id, from_status, to_status, changed_at, changed_by }` | Любая смена статуса | `reports`, `analytics`, `comms` |
| `assignments.assignment.overdue` | `{ schema_version, assignment_id, child_id, due_date, detected_at }` | Детект просрочки | `comms`, `analytics`, `supervision` |
| `assignments.assignment.cancelled` | `{ schema_version, assignment_id, child_id, cancelled_at, reason, cancelled_by }` | Снятие задания | `reports`, `analytics` |

### 2.6 Сервис `reports`
| Event | Payload | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `reports.report.submitted` | `{ schema_version, report_id, assignment_id, child_id, parent_id, status, submitted_at, duration_minutes, child_mood }` | Родитель отправил отчет | `analytics`, `assignments` (автообновление статуса), `comms` (уведомить специалиста) |
| `reports.report.reviewed` | `{ schema_version, report_id, reviewer_id, review_status, reviewed_at, notes }` | Специалист/супервизор проверил | `analytics`, `comms`, `route-orchestrator` (скорректировать цели) |
| `reports.media.attached` | `{ schema_version, report_id, media_count, files: [ { media_id, type, duration } ], attached_at }` | Загружены медиа | `analytics`, `comms`, `storage-service` |

### 2.7 Сервис `comms`
| Event | Payload | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `comms.notification.sent` | `{ schema_version, notification_id, channel, recipient_id, template, sent_at, status }` | Письмо/уведомление отправлено | `analytics`, `assignments` (обновить напоминания) |
| `comms.notification.failed` | `{ schema_version, notification_id, channel, recipient_id, template, failed_at, reason }` | Ошибка доставки | `analytics`, `support`, `assignments` |

### 2.8 Сервис `analytics`
- Потребляет события всех сервисов, агрегирует, но не публикует доменные события (только технические метрики). Исключение — выгрузка отчетов:
| Event | Payload | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `analytics.dashboard.snapshot_generated` | `{ schema_version, snapshot_id, owner_type, owner_id, period_start, period_end, generated_at }` | Генерация отчета/дашборда | `reports` (архивация), `comms` (уведомления) |

### 2.9 Сервис `templates`
| Event | Payload | Emit conditions | Primary subscribers |
| --- | --- | --- | --- |
| `templates.template.published` | `{ schema_version, template_id, version, published_at, published_by }` | Шаблон переведен в статус `published` | `route-orchestrator`, `analytics` |
| `templates.template.archived` | `{ schema_version, template_id, version, archived_at, archived_by }` | Шаблон выведен из оборота | `route-orchestrator`, `analytics` |
| `templates.template.updated` | `{ schema_version, template_id, new_version, updated_fields, updated_at, updated_by }` | Создана новая версия шаблона | `route-orchestrator`, `analytics` |
| `templates.template.exercise_updated` | `{ schema_version, template_id, template_phase_id, exercise_id, action, updated_at }` | Добавлено/изменено упражнение в шаблоне | `route-orchestrator`, `analytics` |

---

## 3. SQL DDL Migrations

### 3.1 Пользователи и профили

```sql
-- Таблица: users (пользователи)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    external_id VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'specialist', 'supervisor', 'admin')),
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('active', 'suspended', 'invited')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Индекс для быстрого поиска по email
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);

-- Таблица: child (ребенок)
CREATE TABLE child (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20),
    diagnosis_summary TEXT,
    notes TEXT,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Таблица: specialist (профиль специалиста)
CREATE TABLE specialist (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    specialty VARCHAR(50) NOT NULL CHECK (specialty IN ('neuropsychologist', 'speech_therapist', 'aba', 'occupational', 'supervisor', 'other')),
    license_number VARCHAR(100),
    license_valid_until DATE,
    experience_years INT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_specialist_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица: exercise (упражнение из библиотеки)
CREATE TABLE exercise (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    age_min INT,
    age_max INT,
    difficulty VARCHAR(20),
    duration_minutes INT,
    materials JSONB,
    instructions JSONB,
    success_criteria JSONB,
    media_assets JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Таблица: children_parents (связь ребенок — родитель)
CREATE TABLE children_parents (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL,
    parent_user_id UUID NOT NULL,
    legal_guardian BOOLEAN DEFAULT FALSE,
    relationship VARCHAR(50) CHECK (relationship IN ('mother', 'father', 'guardian', 'other')),
    guardianship_type VARCHAR(50),
    invited_at TIMESTAMPTZ,
    linked_at TIMESTAMPTZ,
    CONSTRAINT fk_children_parents_child FOREIGN KEY(child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT fk_children_parents_user FOREIGN KEY(parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_child_parent UNIQUE(child_id, parent_user_id)
);

-- Таблица: children_specialists (связь ребенок — специалист)
CREATE TABLE children_specialists (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL,
    specialist_id UUID NOT NULL,
    specialization VARCHAR(50) CHECK (specialization IN ('lead', 'speech', 'aba', 'occupational', 'supervisor', 'other')),
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    released_at TIMESTAMPTZ,
    role_description TEXT,
    CONSTRAINT fk_children_spec_child FOREIGN KEY(child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT fk_children_spec_specialist FOREIGN KEY(specialist_id) REFERENCES specialist(id) ON DELETE CASCADE,
    CONSTRAINT uq_child_specialist_spec UNIQUE(child_id, specialist_id, specialization)
);
```

### 3.2 Диагностические сессии

```sql
-- Таблица: diagnostic_sessions (диагностический сеанс)
CREATE TABLE diagnostic_sessions (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL,
    performed_by UUID NOT NULL,
    questionnaire_code VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
    score_total DECIMAL(10,2),
    score_raw JSONB,
    interpretation_level VARCHAR(50),
    notes TEXT,
    CONSTRAINT fk_diagnostic_child FOREIGN KEY(child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT fk_diagnostic_specialist FOREIGN KEY(performed_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_completed_at CHECK ((status = 'completed' AND completed_at IS NOT NULL) OR (status != 'completed'))
);

-- Таблица: diagnostic_session_results (результаты диагностики)
CREATE TABLE diagnostic_session_results (
    session_id UUID PRIMARY KEY,
    answers JSONB NOT NULL,
    scoring JSONB,
    risk_flags JSONB,
    CONSTRAINT fk_results_session FOREIGN KEY(session_id) REFERENCES diagnostic_sessions(id) ON DELETE CASCADE
);
```

### 3.3 Коррекционный маршрут и версии

```sql
-- Таблица: route (коррекционный маршрут)
CREATE TABLE route (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL,
    lead_specialist_id UUID NOT NULL,
    template_id UUID,
    active_version_id UUID,
    baseline_snapshot_id UUID,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    plan_horizon_weeks INT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_route_child FOREIGN KEY(child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT fk_route_lead FOREIGN KEY(lead_specialist_id) REFERENCES specialist(id) ON DELETE RESTRICT,
    CONSTRAINT fk_route_template FOREIGN KEY(template_id) REFERENCES route_templates(id) ON DELETE SET NULL
);

-- Уникальный индекс: один активный маршрут на ребенка
CREATE UNIQUE INDEX uniq_active_route_per_child ON route(child_id) WHERE status = 'active';

-- Таблица: route_revision_history (история версий маршрута)
CREATE TABLE route_revision_history (
    id UUID PRIMARY KEY,
    route_id UUID NOT NULL,
    version INT NOT NULL,
    payload JSONB NOT NULL,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    change_reason TEXT,
    CONSTRAINT fk_revision_route FOREIGN KEY(route_id) REFERENCES route(id) ON DELETE CASCADE,
    CONSTRAINT fk_revision_specialist FOREIGN KEY(changed_by) REFERENCES specialist(id) ON DELETE RESTRICT,
    CONSTRAINT uq_route_version UNIQUE(route_id, version)
);
```

### 3.3 Цели и фазы маршрута

```sql
-- Таблица: route_goals (цели маршрута)
CREATE TABLE route_goals (
    id UUID PRIMARY KEY,
    route_id UUID NOT NULL,
    phase_id UUID,
    category VARCHAR(100),
    goal_type VARCHAR(50) CHECK (goal_type IN ('skill', 'behaviour', 'academic', 'other')),
    description TEXT NOT NULL,
    target_metric VARCHAR(100),
    measurement_unit VARCHAR(50),
    baseline_value DECIMAL(10,2),
    target_value DECIMAL(10,2),
    review_period_weeks INT,
    priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_goal_route FOREIGN KEY(route_id) REFERENCES route(id) ON DELETE CASCADE,
    CONSTRAINT fk_goal_phase FOREIGN KEY(phase_id) REFERENCES route_phases(id) ON DELETE SET NULL
);

-- Таблица: route_phases (фазы маршрута)
CREATE TABLE route_phases (
    id UUID PRIMARY KEY,
    route_id UUID NOT NULL,
    responsible_specialist_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    parallel_group INT,
    status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'on_hold', 'completed')),
    start_date DATE,
    end_date DATE,
    duration_weeks INT,
    expected_outcomes TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_phase_route FOREIGN KEY(route_id) REFERENCES route(id) ON DELETE CASCADE,
    CONSTRAINT fk_phase_specialist FOREIGN KEY(responsible_specialist_id) REFERENCES specialist(id) ON DELETE RESTRICT,
    CONSTRAINT uq_phase_order UNIQUE(route_id, order_index)
);

-- Таблица: route_phase_milestones (контрольные точки фазы)
CREATE TABLE route_phase_milestones (
    id UUID PRIMARY KEY,
    phase_id UUID NOT NULL,
    goal_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    checkpoint_type VARCHAR(50) CHECK (checkpoint_type IN ('assessment', 'observation', 'meeting')),
    due_week INT,
    success_criteria TEXT,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'due', 'completed', 'overdue')),
    completed_at TIMESTAMPTZ,
    evidence_links JSONB,
    CONSTRAINT fk_milestone_phase FOREIGN KEY(phase_id) REFERENCES route_phases(id) ON DELETE CASCADE,
    CONSTRAINT fk_milestone_goal FOREIGN KEY(goal_id) REFERENCES route_goals(id) ON DELETE SET NULL
);
```

### 3.4 Связующие таблицы (Many-to-Many)

```sql
-- Таблица: phase_exercises (связь фаза — упражнение)
CREATE TABLE phase_exercises (
    id UUID PRIMARY KEY,
    phase_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    order_index INT,
    frequency_per_week INT,
    duration_minutes INT,
    notes TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_phase_ex_phase FOREIGN KEY(phase_id) REFERENCES route_phases(id) ON DELETE CASCADE,
    CONSTRAINT fk_phase_ex_exercise FOREIGN KEY(exercise_id) REFERENCES exercise(id) ON DELETE RESTRICT,
    CONSTRAINT uq_phase_exercise UNIQUE(phase_id, exercise_id),
    CONSTRAINT uq_phase_order_idx UNIQUE(phase_id, order_index)
);

-- Таблица: goal_exercises (связь цель — упражнение)
CREATE TABLE goal_exercises (
    id UUID PRIMARY KEY,
    goal_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    contribution_level VARCHAR(20) CHECK (contribution_level IN ('primary', 'supporting')),
    notes TEXT,
    CONSTRAINT fk_goal_ex_goal FOREIGN KEY(goal_id) REFERENCES route_goals(id) ON DELETE CASCADE,
    CONSTRAINT fk_goal_ex_exercise FOREIGN KEY(exercise_id) REFERENCES exercise(id) ON DELETE RESTRICT,
    CONSTRAINT uq_goal_exercise UNIQUE(goal_id, exercise_id)
);
```

### 3.5 Шаблоны маршрутов

```sql
-- Таблица: route_templates (шаблон маршрута)
CREATE TABLE route_templates (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_age_range VARCHAR(50),
    severity_level VARCHAR(50),
    version INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- Таблица: template_phases (фаза шаблона)
CREATE TABLE template_phases (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    duration_weeks INT,
    specialty_hint VARCHAR(100),
    notes TEXT,
    CONSTRAINT fk_template_phase_template FOREIGN KEY(template_id) REFERENCES route_templates(id) ON DELETE CASCADE,
    CONSTRAINT uq_template_phase_order UNIQUE(template_id, order_index)
);

-- Таблица: template_goals (цель шаблона)
CREATE TABLE template_goals (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL,
    template_phase_id UUID,
    category VARCHAR(100),
    goal_type VARCHAR(50),
    description TEXT NOT NULL,
    target_metric VARCHAR(100),
    measurement_unit VARCHAR(50),
    baseline_guideline TEXT,
    target_guideline TEXT,
    priority VARCHAR(20),
    notes TEXT,
    CONSTRAINT fk_template_goal_template FOREIGN KEY(template_id) REFERENCES route_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_template_goal_phase FOREIGN KEY(template_phase_id) REFERENCES template_phases(id) ON DELETE SET NULL
);

-- Таблица: template_milestones (контрольные точки шаблона)
CREATE TABLE template_milestones (
    id UUID PRIMARY KEY,
    template_phase_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    checkpoint_type VARCHAR(50),
    due_week INT,
    success_criteria TEXT,
    CONSTRAINT fk_template_ms_phase FOREIGN KEY(template_phase_id) REFERENCES template_phases(id) ON DELETE CASCADE
);

-- Таблица: template_exercises (связь шаблон — упражнение)
CREATE TABLE template_exercises (
    id UUID PRIMARY KEY,
    template_phase_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    template_goal_id UUID,
    order_index INT,
    frequency_per_week INT,
    duration_minutes INT,
    notes TEXT,
    CONSTRAINT fk_template_ex_phase FOREIGN KEY(template_phase_id) REFERENCES template_phases(id) ON DELETE CASCADE,
    CONSTRAINT fk_template_ex_exercise FOREIGN KEY(exercise_id) REFERENCES exercise(id) ON DELETE RESTRICT,
    CONSTRAINT fk_template_ex_goal FOREIGN KEY(template_goal_id) REFERENCES template_goals(id) ON DELETE SET NULL
);
```

### 3.6 Назначения и отчеты

```sql
-- Таблица: assignments (назначение упражнения)
CREATE TABLE assignments (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    assigned_by_id UUID NOT NULL,
    route_id UUID NOT NULL,
    phase_id UUID NOT NULL,
    target_goal_id UUID,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    planned_start_date DATE,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue', 'cancelled')),
    delivery_channel VARCHAR(20) CHECK (delivery_channel IN ('in_person', 'home', 'telepractice')),
    notes TEXT,
    frequency_per_week INT,
    expected_duration_minutes INT,
    reminder_policy JSONB,
    CONSTRAINT fk_assignment_child FOREIGN KEY(child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_exercise FOREIGN KEY(exercise_id) REFERENCES exercise(id) ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_specialist FOREIGN KEY(assigned_by_id) REFERENCES specialist(id) ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_route FOREIGN KEY(route_id) REFERENCES route(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_phase FOREIGN KEY(phase_id) REFERENCES route_phases(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_goal FOREIGN KEY(target_goal_id) REFERENCES route_goals(id) ON DELETE SET NULL
);

-- Таблица: reports (отчет о выполнении)
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    assignment_id UUID NOT NULL,
    parent_id UUID NOT NULL,
    reviewed_by UUID,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status VARCHAR(20) CHECK (status IN ('completed', 'partial', 'failed')),
    duration_minutes INT,
    child_mood VARCHAR(50),
    feedback_text TEXT,
    media JSONB,
    auto_score DECIMAL(5,2),
    reviewed_at TIMESTAMPTZ,
    review_status VARCHAR(20) DEFAULT 'not_reviewed' CHECK (review_status IN ('not_reviewed', 'approved', 'needs_attention', 'rejected')),
    CONSTRAINT fk_report_assignment FOREIGN KEY(assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_parent FOREIGN KEY(parent_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_report_reviewer FOREIGN KEY(reviewed_by) REFERENCES specialist(id) ON DELETE SET NULL
);

-- Таблица: assignment_history (история назначений - аудит)
CREATE TABLE assignment_history (
    id UUID PRIMARY KEY,
    assignment_id UUID NOT NULL,
    changed_by UUID NOT NULL,
    event_type VARCHAR(50) CHECK (event_type IN ('status_change', 'reassigned', 'cancelled')),
    from_status VARCHAR(20),
    to_status VARCHAR(20),
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB,
    CONSTRAINT fk_history_assignment FOREIGN KEY(assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY(changed_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

### 3.7 Дополнительные таблицы

```sql
-- Таблица: route_recommendations (рекомендации из диагностики)
CREATE TABLE route_recommendations (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    goal_stub JSONB NOT NULL,
    confidence DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_recommendation_session FOREIGN KEY(session_id) REFERENCES diagnostic_sessions(id) ON DELETE CASCADE
);

-- Таблица: report_reviews (комментарии специалистов к отчетам)
CREATE TABLE report_reviews (
    id UUID PRIMARY KEY,
    report_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    review_status VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_review_report FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_specialist FOREIGN KEY(reviewer_id) REFERENCES specialist(id) ON DELETE RESTRICT
);

-- Таблица: media_assets (медиа-ресурсы)
CREATE TABLE media_assets (
    id UUID PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL,
    owner_id UUID NOT NULL,
    media_type VARCHAR(50),
    path VARCHAR(500) NOT NULL,
    checksum VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ
);

-- Таблица: notifications (уведомления)
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    channel VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INT DEFAULT 0,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Таблица: event_outbox (Outbox Pattern для событий)
CREATE TABLE event_outbox (
    id UUID PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed'))
);

CREATE INDEX idx_outbox_pending ON event_outbox(status, created_at) WHERE status = 'pending';
```

### 3.8 JSON Schema для JSONB полей

**materials** (упражнения):
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name": {"type": "string"},
      "quantity": {"type": "integer"},
      "optional": {"type": "boolean"}
    }
  }
}
```

**instructions** (упражнения):
```json
{
  "type": "object",
  "properties": {
    "steps": {
      "type": "array",
      "items": {"type": "string"}
    },
    "duration_per_step": {
      "type": "array",
      "items": {"type": "integer"}
    },
    "visual_aids": {
      "type": "array",
      "items": {"type": "string"}
    }
  }
}
```

**reminder_policy** (назначения):
```json
{
  "type": "object",
  "properties": {
    "enabled": {"type": "boolean"},
    "frequency": {"type": "string", "enum": ["daily", "before_due", "weekly"]},
    "advance_days": {"type": "integer"},
    "channels": {
      "type": "array",
      "items": {"type": "string", "enum": ["email", "sms", "push"]}
    }
  }
}
```

---

## 4. Constitution Check: Бизнес-ограничения целостности

### 4.1 Фаза без маршрута недопустима
**Правило:** Нельзя создать фазу (Phase) без привязки к существующему маршруту.
- `phase.route_id` обязательно и должно ссылаться на валидный маршрут
- При удалении маршрута связанные фазы удаляются каскадно (ON DELETE CASCADE)
- **Реализация:** Foreign Key constraint на уровне БД

### 4.2 Упражнение не должно «висеть» вне фазы
**Правило:** В пределах маршрута все упражнения должны быть привязаны к конкретным фазам.
- Нельзя добавить упражнение напрямую в маршрут без указания фазы
- Добавление упражнения идет через таблицу `phase_exercises`
- **Реализация:** Бизнес-логика API проверяет наличие записи в `phase_exercises` перед созданием assignment

### 4.3 Цель не может существовать без маршрута
**Правило:** Каждая цель развития (Goal) должна быть привязана к маршруту.
- `goal.route_id` обязательно
- `goal.phase_id` опционально (если NULL — цель относится ко всему маршруту)
- **Реализация:** NOT NULL constraint + Foreign Key

### 4.4 Назначение только в контексте маршрута
**Правило:** Нельзя назначить ребенку упражнение без активного маршрута.
- При создании Assignment необходимо указывать `phase_id`
- `assignment.exercise_id` должен соответствовать одному из упражнений фазы (проверка через `phase_exercises`)
- **Реализация:** Триггер/CHECK или бизнес-логика проверяет `assignment.child_id = route.child_id` через `phase_id -> route_id`

### 4.5 Упражнение должно быть связано с целью
**Правило:** Каждое упражнение в маршруте должно способствовать достижению целей.
- Для каждого упражнения в `phase_exercises` должна существовать запись в `goal_exercises`
- **Реализация:** Валидация при сохранении маршрута — предупреждение, если упражнение не связано с целями

### 4.6 Нельзя активировать пустой маршрут
**Правило:** Статус маршрута можно перевести из 'draft' в 'active' только если:
- Маршрут содержит хотя бы одну фазу
- Маршрут содержит хотя бы одну цель
- Каждая фаза содержит хотя бы одно упражнение
- **Реализация:** Бизнес-логика возвращает 400 Bad Request при попытке активации пустого маршрута

### 4.7 Единственный активный маршрут на ребенка
**Правило:** У одного ребенка может быть только один активный маршрут одновременно.
- Перед активацией нового маршрута необходимо завершить/приостановить текущий активный
- **Реализация:**
```sql
CREATE UNIQUE INDEX uniq_active_route_per_child
ON route(child_id) WHERE status = 'active';
```

### 4.8 Уникальность и порядок фаз
**Правило:** Порядок фаз должен быть уникальным в пределах маршрута.
- `phase.order_index` уникален для каждого `route_id`
- Нумерация последовательная: 1, 2, 3, ...
- При удалении фазы порядок пересчитывается
- **Реализация:** UNIQUE constraint `(route_id, order_index)`

### 4.9 Целостность при редактировании маршрута
**Правило:** При внесении изменений в активный маршрут сохраняется история версий.
- Перед применением изменений старая версия сохраняется в `route_revision_history`
- Нельзя удалить фазу с выполненными отчетами без сохранения данных
- **Реализация:**
  1. Считать текущую версию маршрута
  2. Создать запись в `route_revision_history` со snapshot
  3. Применить изменения к маршруту
  4. Увеличить `route.version` на +1

### 4.10 Валидация ссылок на справочники
**Правило:** Все внешние ключи должны ссылаться на существующие сущности.
- `child_id` → существующий ребенок
- `specialist_id` → существующий специалист
- `exercise_id` → существующее упражнение в библиотеке
- `lead_specialist_id` → специалист с действующей лицензией (`license_valid_until >= CURRENT_DATE`)
- **Реализация:** Foreign Key constraints + бизнес-логика API возвращает 400/404 при невалидных ID

---

## 5. Архитектурные и процессные примечания
- **Границы сервисов:** каждая таблица принадлежит конкретному сервису. Доступ осуществляется через публичные API/контракты. Например, `diagnostic_sessions` и `diagnostic_session_results` находятся в домене `diagnostics`; сервисы-потребители получают данные по API или через события.
- **Outbox-таблицы:** в каждом сервисе создается `event_outbox` с полями `id, event_name, payload JSONB, created_at, published_at, status`. Публикация происходит в фоновом воркере, чтобы обеспечить exactly-once semantics.
- **GDPR/152-ФЗ:** таблицы `children`, `users`, `reports` содержат PII и медицинские данные, требующие ретеншн-политик и soft-delete. События не должны раскрывать избыточные данные; payload ограничивается необходимым минимумом.
- **Идентификаторы:** UUID v7 для упорядочиваемости по времени.
- **Согласование версий:** любые изменения в payload требуют обновления `schema_version` и документации. Клиенты обязаны поддерживать backward compatibility на один минор.

---

## 6. Следующие шаги

### Завершено в версии 0.2
- ✅ Подготовлены полные SQL DDL миграции для всех 27 таблиц
- ✅ Систематизированы 10 Constitution Check правил
- ✅ Добавлены JSON-схемы для JSONB полей
- ✅ Обогащены события метаполями (correlation_id, causation_id, actor_id)
- ✅ Добавлены недостающие таблицы (users, children_parents, children_specialists, diagnostic_sessions, diagnostic_session_results)

### В работе
1. **OpenAPI/tRPC контракты:** Сгенерировать полные спецификации для:
   - Route operations (CRUD + activation/pause/complete)
   - Phase operations (с учётом parallel_group)
   - Goal operations (связь с упражнениями через goal_exercises)
   - Assignment operations (с валидацией через phase_exercises)
   - Template operations (apply to route)

2. **Event Streaming Infrastructure:**
   - Настроить подписчиков для доменных событий (DLQ, retry policies)
   - Реализовать Outbox Pattern worker для каждого сервиса
   - Добавить event replayer для тестирования
   - Настроить схема-регистр (Schema Registry) для версионирования событий

3. **Data Governance:**
   - Согласовать с юристами регламенты хранения PII данных (GDPR, 152-ФЗ, HIPAA)
   - Определить retention policies для `reports`, `assignment_history`, `route_revision_history`
   - Настроить soft-delete для `children`, `users`
   - Реализовать механизм экспорта/удаления персональных данных (GDPR Article 17)

4. **Миграции данных:**
   - Миграция `owner_specialist_id → lead_specialist_id` (если есть legacy данные)
   - Заполнение junction-таблиц (`phase_exercises`, `goal_exercises`)
   - Валидация целостности данных через Constitution Check правила
   - Создание seeders для тестовых шаблонов маршрутов

5. **Публикация шаблонов:**
   - Согласовать с методистами workflow публикации шаблонов
   - Реализовать версионирование шаблонов (increment version при published)
   - Ограничение: только одна версия шаблона в статусе `published` одновременно

### Будущие расширения
Документ актуален до появления дополнительных модулей:
- **Billing:** интеграция с платёжными системами
- **Training:** обучающие материалы для специалистов
- **RTC Media:** real-time коммуникация (видеоконсультации)
- **ML/AI:** автоматические рекомендации упражнений по результатам диагностики

При расширении домена — обновить ERD, каталог событий и Constitution Check правила.
