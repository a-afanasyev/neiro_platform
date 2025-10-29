# ТЕХНИЧЕСКОЕ ЗАДАНИЕ
# Платформа "Neiro" - Система нейропсихологического сопровождения детей с Особенностями

**Версия:** 3.1 *(обновлено 28 октября 2025)*
**Дата первоначальной версии:** 21 декабря 2024
**Статус:** Техническое задание для разработки
**Команда:** Frontend + Backend + DevOps

> **Single Source of Truth**
>
> - Настоящий документ является каноническим источником продуктовых и инженерных требований платформы Neiro.
> - Все изменения в требуемых разделах проходят через владельцев и фиксируются в `Статусе готовности документации`.
> - Guideline по обновлению: [`DOCUMENTATION_UPDATE_GUIDELINE.md`](DOCUMENTATION_UPDATE_GUIDELINE.md)

| Разделы документа | Владельцы | Ответственность |
| --- | --- | --- |
| §1 «Обзор проекта», жизненный цикл, ценностные предложения | Product Lead | Актуальность миссии, пользовательских сценариев, метрик |
| §2–§4 «Архитектура и функциональные требования» | Lead Engineer | Архитектурные решения, границы сервисов, технический стек, критерии функционала |
| §5 «Интерфейсы и UX» | Product Lead · Design Lead | UX-паттерны, соответствие CJM и дизайн-системе |
| §6 «Безопасность и соответствие» | Security & Compliance Officer | Политики данных, регуляторика, безопасность |
| §7–§8 «Интеграции, инфраструктура» | Lead Engineer · DevOps Lead | Внешние интерфейсы, окружения, CI/CD, эксплуатация |
| §9–§10 «Этапы разработки и приемка» | Delivery Manager | Планирование релизов, Definition of Done, критерии приемки |

**Изменения в версии 3.1:**
- ✅ Раздел 3.2: Добавлено управление специалистами с лицензиями
- ✅ Раздел 3.4: Расширена модель маршрутов (template lifecycle, версионирование, параллельные фазы)
- ✅ Раздел 6: Обновлена информация о безопасности (GDPR retention policies, Row-Level Security, аудит)
- ✅ Раздел 7.2: Добавлены ссылки на API_CONTRACTS_MVP.md и описание Event-Driven Architecture
- ✅ По всему документу: Добавлены ссылки на `DATA_MODEL_AND_EVENTS.md` v0.2 и `API_CONTRACTS_MVP.md` v0.6
- ✅ Заключение: Добавлена таблица статуса готовности документации

---

## ОГЛАВЛЕНИЕ

1. [Обзор проекта](#1-обзор-проекта)
2. [Архитектура системы](#2-архитектура-системы)
3. [Модульные требования и сценарии использования](#3-модульные-требования-и-сценарии-использования)
4. [Данные и доменные события](#4-данные-и-доменные-события)
5. [Технические требования](#5-технические-требования)
6. [Интерфейсы и UX](#6-интерфейсы-и-ux)
7. [Безопасность и соответствие](#7-безопасность-и-соответствие)
8. [Интеграции](#8-интеграции)
9. [Инфраструктура и эксплуатация](#9-инфраструктура-и-эксплуатация)
10. [Путь к продакшену](#10-путь-к-продакшену)
11. [Критерии приемки](#11-критерии-приемки)

---

### Ключевые артефакты

| Артефакт | Назначение | Ключевые разделы / владелец | Ссылка |
| --- | --- | --- | --- |
| neiro.md | Продуктовый контекст, миссия, бизнес-цели | §1 · Product Lead | [neiro.md](neiro.md) |
| Neiro_CJM_Extended.md | CJM и сценарии ролей | §3, §6 · Product Lead | [Neiro_CJM_Extended.md](Neiro_CJM_Extended.md) |
| BUSINESS_PROCESSES_AND_WORKFLOWS.md | Бизнес-процессы, KPI, контроль | §3, §7 · Product Lead / Head of Clinical Ops | [BUSINESS_PROCESSES_AND_WORKFLOWS.md](BUSINESS_PROCESSES_AND_WORKFLOWS.md) |
| DATA_MODEL_AND_EVENTS.md | ERD, сущности, события, Constitution Check | §4 · Lead Engineer | [DATA_MODEL_AND_EVENTS.md](DATA_MODEL_AND_EVENTS.md) |
| Correction_route.md | Функциональные требования по маршрутам | §3, §4 · Head of Clinical Ops | [Correction_route.md](Correction_route.md) |
| API_CONTRACTS_MVP.md | REST/tRPC контракты и схемы авторизации | §3, §8 · Lead Engineer | [API_CONTRACTS_MVP.md](API_CONTRACTS_MVP.md) |
| DESIGN_SYSTEM.md | Дизайн-система, компоненты, гайды | §6 · Design Lead | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| UI_KIT.md | Реализация UI-паттернов | §6 · Design Lead | [UI_KIT.md](UI_KIT.md) |
| DATA_GOVERNANCE.md | Политики данных, DSAR, ретеншн | §4, §7 · Security & Compliance Officer | [DATA_GOVERNANCE.md](DATA_GOVERNANCE.md) |
| DOCUMENTATION_UPDATE_GUIDELINE.md | Регламент обновления SoT | Преамбула · Documentation Owners | [DOCUMENTATION_UPDATE_GUIDELINE.md](DOCUMENTATION_UPDATE_GUIDELINE.md) |

---

## 1. ОБЗОР ПРОЕКТА

### 1.1 Описание системы

**Neiro** - это комплексная веб-платформа для нейропсихологического сопровождения детей с расстройствами аутистического спектра (РАС). Система объединяет диагностику, планирование терапии, выполнение упражнений и мониторинг прогресса в едином цифровом пространстве.

### 1.2 Целевая аудитория

**Основные пользователи:**
- **Нейропсихологи** - ведущие специалисты, координирующие процесс
- **Логопеды, дефектологи, АВА-терапевты** - профильные специалисты
- **Родители детей с РАС** - основные исполнители домашних заданий
- **Супервизоры** - контролирующие качество работы
- **Администраторы** - управляющие системой и пользователями

### 1.3 Ключевые возможности

- 🔍 **Диагностический модуль** - стандартизированные опросники и тесты
- 📋 **Коррекционные маршруты** - индивидуальные планы развития
- 🎯 **Библиотека упражнений** - структурированные терапевтические задания
- 💬 **Коммуникационная система** - чаты, видеоконсультации, уведомления
- 📊 **Аналитика и отчетность** - отслеживание прогресса и результатов
- 📱 **Мобильная версия** - PWA и Telegram Bot для удобства использования

### 1.4 Миссия и целевые ориентиры

- **Миссия:** обеспечить непрерывное, качественное и измеримое сопровождение детей с РАС за счет единой цифровой среды для специалистов, родителей и организаций (`neiro.md`, §1.2).
- **Пилотный охват:** дети 2–15 лет с РАС и их семьи; запуск в СНГ с перспективой международной экспансии (`neiro.md`, §1.3).
- **Целевые показатели первого года:** до 1000 активных специалистов и семей, поддержка русского языка с планом локализации на узбекский и английский.

### 1.5 Ключевые проблемы, которые решает платформа

1. **Фрагментированность данных**
   - Диагностические результаты и отчеты хранятся разрозненно.
   - Отсутствует единая картина прогресса и прозрачность командной работы.
2. **Слабая структурированность коррекции**
   - Нет общего плана, сложно отслеживать выполнение и эффективность терапии.
3. **Коммуникационные барьеры**
   - Родителям сложно понимать терминологию, специалистам — синхронизироваться между собой.
4. **Ограничения по времени и географии**
   - Необходимость регулярных очных визитов снижает доступность качественного сопровождения.

_Источник:_ `neiro.md`, §3.1–3.2.

### 1.6 Ценностное предложение по ролям

- **Нейропсихологи и профильные специалисты:** автоматизация диагностики, конструктор маршрутов, совместная работа с командой, удалённое сопровождение и библиотека методик (`neiro.md`, §2.1; §6.5).
- **Родители:** понятные инструкции, визуализация прогресса, двухсторонняя связь с командой, доступ к образовательным материалам и системе мотивации ребенка (`neiro.md`, §2.2–2.3; §6.6).
- **Супервизоры и методисты:** контроль качества, версионирование маршрутов, аналитика эффективности и инструменты для рецензирования шаблонов (`neiro.md`, §2.1; §6.8).
- **Администраторы организаций:** стандартизация процессов, управление доступами и лицензиями, сбор KPI и соответствие регуляторным требованиям (`neiro.md`, §2.4; §17–19).

### 1.7 Жизненный цикл сопровождения ребенка

Платформа поддерживает полный цикл взаимодействия с семьей:

1. **Этап знакомства (1–2 недели):** регистрация семьи, первичный скрининг, назначение консультации.
2. **Диагностика (2–3 недели):** проведение тестов, консилиум специалистов, формирование рекомендаций.
3. **Планирование (≈1 неделя):** выбор шаблона, настройка фаз и контрольных точек, согласование с родителями.
4. **Активная работа (3–6 месяцев):** выполнение занятий в центре и дома, контроль назначений и материалов.
5. **Оценка результатов (1–2 недели):** фиксация достижений, корректировка маршрута, выпуск итогового отчета.
6. **Этап поддержки (постоянно):** сопровождение семьи, новые циклы диагностики при необходимости.

_Источник:_ `neiro.md`, §8.

### 1.8 Связанные артефакты

- `neiro.md` — продуктовый контекст, миссия и жизненный цикл.
- `Neiro_CJM_Extended.md` — подробные CJM для всех ролей.
- `BUSINESS_PROCESSES_AND_WORKFLOWS.md` — регламенты процессов и KPI.
- Маркетинговые материалы (Pitch deck, лендинг) — ссылки добавляются по мере готовности.

---

## 2. АРХИТЕКТУРА СИСТЕМЫ

### 2.1 Общая архитектура

````mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Next.js Web App<br/>React + TypeScript]
        PWA[PWA Mobile App]
        TG[Telegram WebApp]
    end
    
    subgraph "API Layer"
        API[REST API<br/>Node.js/Express]
        WS[WebSocket Server<br/>Real-time]
        AUTH[Auth Service<br/>JWT]
    end
    
    subgraph "Business Logic"
        DIAG[Diagnostic Module]
        ROUTE[Route Management]
        EXERCISE[Exercise Engine]
        COMM[Communication Hub]
        ANALYTICS[Analytics Engine]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Main Database)]
        REDIS[(Redis<br/>Cache & Sessions)]
        FILES[File Storage<br/>MinIO/S3]
        MEDIA[Media Storage<br/>Videos/Images]
    end
    
    subgraph "External Services"
        EMAIL[Email Service]
        SMS[SMS Gateway]
        TG_BOT[Telegram Bot API]
        VIDEO[Video Conference<br/>WebRTC]
    end
    
    WEB --> API
    PWA --> API
    TG --> API
    
    API --> DIAG
    API --> ROUTE
    API --> EXERCISE
    API --> COMM
    API --> ANALYTICS
    
    DIAG --> DB
    ROUTE --> DB
    EXERCISE --> DB
    COMM --> DB
    ANALYTICS --> DB
    
    API --> REDIS
    API --> FILES
    API --> MEDIA
    
    API --> EMAIL
    API --> SMS
    API --> TG_BOT
    WS --> VIDEO
```

### 2.2 Технологический стек

**Frontend:**
- Next.js 14+ (App Router, React 18, SSR/SSG)
- TypeScript (strict mode)
- Tailwind CSS для стилизации
- Radix UI для компонентов
- React Hook Form для форм
- Recharts для графиков
- PWA для мобильной версии

**Backend:**
- Node.js с Express.js
- TypeScript для типизации
- Prisma ORM для работы с БД
- PostgreSQL как основная БД
- Redis для кеширования и сессий
- WebSocket для real-time коммуникации

**DevOps:**
- Docker для контейнеризации
- Docker Compose для локальной разработки
- Вся разработка и автоматические тесты выполняются внутри контейнеров (Docker/Compose для локали, CI-образы для пайплайнов)
- Kubernetes для продакшена
- Nginx как reverse proxy
- Let's Encrypt для SSL

### 2.3 Связанные артефакты

- Архитектурные диаграммы (Figma/Whimsical) — ссылка добавляется по мере публикации.
- `constitution.md` §2–§4 — архитектурные принципы и стек.
- `DATA_MODEL_AND_EVENTS.md` §1 — привязка данных к сервисам.
- `Neiro Platform Design v2` (репозиторий) — структура фронтенд-приложения.

---

## 3. МОДУЛЬНЫЕ ТРЕБОВАНИЯ И СЦЕНАРИИ ИСПОЛЬЗОВАНИЯ

### 3.1 Модуль аутентификации и авторизации

**Функции:**
- Регистрация пользователей (родители, специалисты)
- Вход в систему с ролевой моделью
- Восстановление пароля
- Двухфакторная аутентификация (опционально)
- Управление сессиями

**Роли и права доступа:**
```typescript
enum UserRole {
  PARENT = 'parent',
  SPECIALIST = 'specialist', 
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin'
}

interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}
```

### 3.2 Модуль управления детьми и специалистами

> **📊 Модель данных:** `DATA_MODEL_AND_EVENTS.md` Section 1.1-1.5

**Функции управления детьми:**
- Создание профилей детей
- **Привязка к родителям** через `children_parents` (M:N с типом родства)
- **Привязка к специалистам** через `children_specialists` (команда специалистов)
- История изменений профиля
- Медицинская информация (diagnosis_summary)
- Документы и файлы через media_assets
- Soft-delete через archived_at (GDPR compliance)

**Структура данных:**
```typescript
interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'male' | 'female';
  diagnosisSummary: string;              // Краткое описание диагноза
  notes?: string;
  archivedAt?: Date;                     // NEW: Soft-delete для GDPR
  parents: ChildParent[];                // NEW: Связь M:N с типом родства
  specialists: ChildSpecialist[];        // NEW: Команда специалистов
  createdAt: Date;
  updatedAt: Date;
}

interface ChildParent {
  childId: string;
  parentUserId: string;
  legalGuardian: boolean;                // Законный представитель
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  guardianshipType?: string;
  invitedAt?: Date;
  linkedAt?: Date;
}

interface ChildSpecialist {
  childId: string;
  specialistId: string;
  specialization: 'lead' | 'speech' | 'aba' | 'occupational' | 'supervisor' | 'other';
  isPrimary: boolean;                    // Основной специалист
  assignedAt: Date;
  releasedAt?: Date;                     // Дата окончания работы
  roleDescription?: string;
}
```

**Управление специалистами (NEW):**

```typescript
interface Specialist {
  id: string;
  userId: string;                        // Ссылка на users
  specialty: 'neuropsychologist' | 'speech_therapist' | 'aba' | 'occupational' | 'supervisor' | 'other';
  licenseNumber?: string;                // NEW: Номер лицензии
  licenseValidUntil?: Date;              // NEW: Дата окончания лицензии
  experienceYears?: number;              // NEW: Стаж работы
  bio?: string;                          // Краткая биография
  createdAt: Date;
  updatedAt: Date;
}

// Constitution Check для специалистов:
// - lead_specialist_id в маршруте должен иметь действующую лицензию
// - При licenseValidUntil < CURRENT_DATE запрещено создание новых маршрутов
// - Система отправляет уведомление за 30 дней до истечения лицензии
```

### 3.3 Диагностический модуль

**Опросники:**
- M-CHAT-R/F (скрининг аутизма)
- CAST (детский тест аутизма)
- SCQ (социальная коммуникация)
- Vineland-3 (адаптивное поведение)
- Дополнительные специализированные тесты

**Функции:**
- Адаптивные опросники с ветвлением
- Автоматический подсчет баллов
- Интерпретация результатов
- Генерация отчетов
- Сравнение результатов во времени

**Структура опросника:**
```typescript
interface Questionnaire {
  id: string;
  name: string;
  description: string;
  ageRange: { min: number; max: number };
  questions: Question[];
  scoringRules: ScoringRule[];
  interpretationRules: InterpretationRule[];
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale' | 'text';
  options?: string[];
  required: boolean;
  conditionalLogic?: ConditionalLogic;
}
```

### 3.4 Система коррекционных маршрутов

> **📖 Спецификация API:** `API_CONTRACTS_MVP.md` Section 6 (Route Orchestrator Service)
> **📊 Модель данных:** `DATA_MODEL_AND_EVENTS.md` Section 1.8-1.12, 3.3-3.5

**Функции:**
- Создание индивидуальных маршрутов
- Автоматическая генерация на основе диагностики
- **Шаблоны маршрутов** с версионированием и lifecycle management
- Ветвление и адаптация маршрутов (параллельные фазы для разных специалистов)
- Контрольные точки и вехи с критериями успеха
- **История версий маршрутов** с возможностью отката (route_revision_history)
- Связывание упражнений с целями через junction-таблицы
- Валидация через **Constitution Check** правила

**Структура маршрута (расширенная):**
```typescript
interface CorrectionRoute {
  id: string;
  childId: string;
  leadSpecialistId: string;           // NEW: Ведущий специалист (обязателен)
  templateId?: string;                 // NEW: Ссылка на шаблон (опционально)
  activeVersionId?: string;            // NEW: ID текущей версии из route_revision_history
  title: string;
  summary: string;                     // NEW: Краткое описание маршрута
  goals: Goal[];                       // Связь через route_goals
  phases: Phase[];                     // Связь через route_phases
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  planHorizonWeeks: number;           // NEW: Горизонт планирования (например, 12 недель)
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Phase {
  id: string;
  routeId: string;
  responsibleSpecialistId: string;    // NEW: Ответственный специалист за фазу
  name: string;
  description: string;
  orderIndex: number;                  // NEW: Порядковый номер (1, 2, 3...)
  parallelGroup?: number;              // NEW: Для параллельных фаз (например, логопед + ABA одновременно)
  status: 'planned' | 'active' | 'on_hold' | 'completed';
  startDate?: Date;
  endDate?: Date;
  durationWeeks: number;
  expectedOutcomes: string;
  exercises: Exercise[];               // Через phase_exercises (M:N с order_index)
  milestones: Milestone[];             // Через route_phase_milestones
  notes?: string;
}

interface Goal {
  id: string;
  routeId: string;
  phaseId?: string;                    // NULL = общая цель для всего маршрута
  category: string;
  goalType: 'skill' | 'behaviour' | 'academic' | 'other';
  description: string;
  targetMetric: string;                // Что измеряем
  measurementUnit: string;             // Единица измерения
  baselineValue?: number;              // Начальное значение
  targetValue?: number;                // Целевое значение
  reviewPeriodWeeks: number;          // Периодичность проверки
  priority: 'high' | 'medium' | 'low';
  status: string;
  linkedExercises: Exercise[];         // NEW: Через goal_exercises (M:N)
}
```

**Template Lifecycle Management (NEW):**

```typescript
interface RouteTemplate {
  id: string;
  title: string;
  description: string;
  targetAgeRange: string;              // "2-4 года", "5-7 лет"
  severityLevel: string;               // "легкая", "средняя", "тяжелая"
  version: number;                     // Инкрементируется при публикации
  status: 'draft' | 'published' | 'archived';
  phases: TemplatePhase[];             // Фазы-шаблоны
  goals: TemplateGoal[];               // Цели-шаблоны
  createdAt: Date;
  publishedAt?: Date;
}

// Workflow управления шаблонами:
// 1. Создание в статусе 'draft' методистом
// 2. Публикация → status='published', version++
// 3. При создании новой версии старая → status='archived'
// 4. Ограничение: только ОДНА версия шаблона в статусе 'published'
// 5. При применении шаблона копируются все фазы, цели, упражнения
```

**Constitution Check для маршрутов:**
1. ✅ Нельзя активировать пустой маршрут (без фаз и целей)
2. ✅ Один активный маршрут на ребенка одновременно
3. ✅ Каждое упражнение должно быть связано с целью через goal_exercises
4. ✅ Фазы имеют уникальный order_index в рамках маршрута
5. ✅ При редактировании активного маршрута сохраняется версия в route_revision_history
6. ✅ lead_specialist_id должен ссылаться на специалиста с действующей лицензией

### 3.5 Библиотека упражнений

**Категории упражнений:**
- Когнитивное развитие
- Речь и коммуникация
- Моторика
- Сенсорная интеграция
- Социальные навыки
- Бытовые навыки
- Академические навыки

**Структура упражнения:**
```typescript
interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  ageRange: { min: number; max: number };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // в минутах
  materials: string[];
  instructions: Instruction[];
  videoUrl?: string;
  imageUrl?: string;
  successCriteria: SuccessCriteria[];
  adaptations: Adaptation[];
}
```

### 3.6 Система назначений и отчетов

**Функции:**
- Назначение упражнений детям
- Отчеты о выполнении от родителей
- Обратная связь от специалистов
- Медиафайлы (фото, видео, аудио)
- Статистика выполнения

**Структура назначения:**
```typescript
interface Assignment {
  id: string;
  childId: string;
  exerciseId: string;
  specialistId: string;
  assignedAt: Date;
  dueDate: Date;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  reports: Report[];
  notes?: string;
}

interface Report {
  id: string;
  assignmentId: string;
  parentId: string;
  submittedAt: Date;
  status: 'completed' | 'partial' | 'failed';
  duration: number;
  notes: string;
  mediaFiles: MediaFile[];
  childMood: 'good' | 'neutral' | 'difficult';
}
```

### 3.7 Коммуникационная система

**Функции:**
- Чаты между пользователями
- Видеоконсультации (WebRTC)
- Система уведомлений
- Групповые обсуждения
- История сообщений

**Каналы уведомлений:**
- Push-уведомления в браузере
- Email
- SMS (критические уведомления)
- Telegram Bot

### 3.8 Аналитика и отчетность

**Типы отчетов:**
- Индивидуальные отчеты по детям
- Отчеты для родителей (упрощенные)
- Статистика для специалистов
- Административные отчеты
- Экспорт в различные форматы

**Метрики:**
- Прогресс по целям
- Выполнение упражнений
- Время занятий
- Динамика показателей
- Эффективность методик

### 3.9 Связанные артефакты

- `Neiro_CJM_Extended.md` — customer journey карты и профессиональные сценарии.
- `Correction_route.md` — детализированные процессы маршрутов и требования качества.
- `API_CONTRACTS_MVP.md` — REST/tRPC контракты модулей.
- `BUSINESS_PROCESSES_AND_WORKFLOWS.md` — регламенты бизнес-процессов и KPI.

---

## 4. ДАННЫЕ И ДОМЕННЫЕ СОБЫТИЯ

### 4.1 ERD и владение данными

- **Назначение:** описание сущностей, ограничений и владения данными для всех сервисов MVP.
- **Источник:** `DATA_MODEL_AND_EVENTS.md` §1, `ERD_и_схема_данных_модуля_коррекционного_маршрута.md`.
- **Ответственность:** Lead Engineer и владельцы сервисов; все изменения проходят Constitution Check.

### 4.2 Доменные события и контракты

- **Каталог событий:** `DATA_MODEL_AND_EVENTS.md` §2 со схемами payload и `schema_version`.
- **Интеграция:** публикация событий через очереди по правилам `constitution.md` §7.
- **Контроль качества:** контрактные тесты, DLQ мониторинг, документация в SoT.

### 4.3 Политики данных и соответствие

- **Политика обработки:** `DATA_GOVERNANCE.md` (DSAR, ретеншн, инциденты).
- **PII/PHI теги:** ведение единого каталога данных, ответственность DPO.
- **Действия при изменениях:** обновление SoT, уведомление заинтересованных сторон, пересмотр процессов.

### 4.4 Связанные артефакты

- `DATA_MODEL_AND_EVENTS.md` — нормативное описание данных и событий.
- `ERD_и_схема_данных_модуля_коррекционного_маршрута.md` — текстовая ERD модулей маршрутов.
- `DATA_GOVERNANCE.md` — политика обработки данных.
- `constitution.md` §5–§7 — требования к владению данными и событийности.

---

## 5. ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ

### 5.1 Производительность

**Требования к производительности:**
- Время загрузки главной страницы: < 2 секунд
- Время отклика API: < 500ms для 95% запросов
- Поддержка 1000+ одновременных пользователей
- Масштабируемость до 10,000+ пользователей

**Оптимизация:**
- Lazy loading компонентов
- Кеширование на уровне API и фронтенда
- CDN для статических ресурсов
- Сжатие изображений и видео
- Database indexing и query optimization

### 5.2 Совместимость

**Браузеры:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Устройства:**
- Desktop (1920x1080 и выше)
- Tablet (768x1024)
- Mobile (375x667 и выше)

**Операционные системы:**
- Windows 10+
- macOS 10.15+
- iOS 14+
- Android 8+

### 5.3 Доступность

**WCAG 2.1 AA соответствие:**
- Поддержка скрин-ридеров
- Навигация с клавиатуры
- Контрастность цветов
- Альтернативный текст для изображений
- Семантическая разметка

### 5.4 Мобильная версия

**PWA требования:**
- Service Worker для офлайн работы
- App Manifest для установки
- Push-уведомления
- Офлайн кеширование контента
- Адаптивный дизайн

**Telegram Bot функции:**
- Уведомления о новых заданиях
- Быстрые отчеты через WebApp
- Напоминания о занятиях
- Простая навигация по функциям

### 5.5 Связанные артефакты

- `constitution.md` §2–§4, §10 — архитектурные принципы, стек и SLO.
- `API_CONTRACTS_MVP.md` — ограничения API и требования совместимости.
- `Neiro Platform Design v2/README.md` — регламент по сборке и инструментам фронтенда.
- Performance dashboards (Grafana) — ссылка добавляется по готовности мониторинга.

---

## 6. ИНТЕРФЕЙСЫ И UX

### 6.1 Дизайн-система

**Основа:**
- Radix UI компоненты
- Tailwind CSS для стилизации
- Lucide React для иконок
- Кастомная цветовая палитра

**Цветовая схема:**
```css
:root {
  --primary: #3b82f6;      /* Синий */
  --secondary: #8b5cf6;    /* Фиолетовый */
  --success: #10b981;      /* Зеленый */
  --warning: #f59e0b;      /* Оранжевый */
  --error: #ef4444;        /* Красный */
  --neutral: #6b7280;      /* Серый */
}
```

### 6.2 Ключевые экраны

**Landing Page:**
- Главная страница с описанием платформы
- Кнопки входа и регистрации
- Информация о возможностях
- Отзывы пользователей

**Dashboard (Специалист):**
- Список активных детей
- Ближайшие консультации
- Новые сообщения
- Быстрые действия

**Dashboard (Родитель):**
- Профиль ребенка
- Текущие задания
- Прогресс развития
- Связь со специалистом

**Диагностика:**
- Выбор опросника
- Адаптивный интерфейс вопросов
- Прогресс-бар
- Сохранение промежуточных результатов

**Библиотека упражнений:**
- Фильтрация по категориям
- Поиск упражнений
- Детальная информация
- Назначение детям

**Календарь:**
- Расписание занятий
- Консультации
- Контрольные точки
- Интеграция с внешними календарями

### 6.3 UX принципы

### 6.4 Связанные артефакты

- `DESIGN_SYSTEM.md` — дизайн-принципы, палитры, компоненты.
- `UI_KIT.md` — реализации компонентов и паттернов.
- `Neiro_CJM_Extended.md` — сценарии UX для всех ролей.
- Figma-библиотека компонентов (ссылка добавляется при публикации).

**Для специалистов:**
- Профессиональный интерфейс
- Детальная информация
- Инструменты анализа
- Быстрые действия

**Для родителей:**
- Простой и понятный интерфейс
- Минимум медицинских терминов
- Визуальные индикаторы прогресса
- Подсказки и помощь

**Общие принципы:**
- Интуитивная навигация
- Консистентность интерфейса
- Быстрая обратная связь
- Адаптивность под устройство

---

## 7. БЕЗОПАСНОСТЬ И СООТВЕТСТВИЕ

> **📊 Модель данных:** `DATA_MODEL_AND_EVENTS.md` Section 5 (Архитектурные примечания, GDPR/152-ФЗ)
> **📖 API Спецификация:** `API_CONTRACTS_MVP.md` Section 1.2 (Формат ошибок), 1.5 (Роли и права)

### 7.1 Защита данных

**Шифрование:**
- HTTPS/TLS 1.3 для всех соединений
- Шифрование данных в БД (PostgreSQL encryption-at-rest)
- Безопасное хранение файлов (MinIO/S3 с server-side encryption)
- Защита API ключей (HashiCorp Vault или AWS Secrets Manager)
- **NEW:** Шифрование PII полей в БД (first_name, last_name, email, phone)

**Аутентификация:**
- JWT токены с коротким временем жизни (15 минут)
- Refresh токены для продления сессий (30 дней)
- Хеширование паролей (bcrypt, cost factor 12)
- Защита от брутфорса (rate limiting + CAPTCHA после 3 попыток)
- **NEW:** 2FA опционально для специалистов и администраторов

### 7.2 Соответствие стандартам

**GDPR (Общий регламент по защите данных):**
- ✅ Согласие на обработку данных (consent checkboxes при регистрации)
- ✅ **Право на удаление данных** — реализовано через soft-delete (`archived_at`)
- ✅ **Портируемость данных** — экспорт в JSON/CSV через API
- ✅ Уведомления об утечках (в течение 72 часов)
- ✅ **NEW:** Data retention policies:
  - `children`, `users` — хранятся пока active или 5 лет после archived_at
  - `reports` — 7 лет (медицинская документация)
  - `assignment_history` — 3 года (аудит)
  - `route_revision_history` — постоянно (клиническая история)

**152-ФЗ (Россия):**
- ✅ Локализация данных в РФ (серверы в российских ЦОД)
- ✅ Согласие законных представителей (`legal_guardian` в `children_parents`)
- ✅ Уведомление Роскомнадзора при инцидентах
- ✅ Защита данных детей (отдельные политики конфиденциальности)

**HIPAA (медицинские данные):**
- ✅ Ограниченный доступ к данным (RBAC + row-level security)
- ✅ **Аудит всех обращений** — реализован через `assignment_history`, `route_revision_history`
- ✅ Шифрование медицинской информации (`diagnosis_summary`, `notes`)
- ✅ Контроль доступа (специалист видит только своих детей)

### 7.3 Контроль доступа

**RBAC модель (расширенная):**
```typescript
interface Role {
  name: 'parent' | 'specialist' | 'supervisor' | 'admin';
  permissions: Permission[];
}

interface Permission {
  resource: string;  // 'routes', 'children', 'reports', 'templates'
  actions: string[]; // 'read', 'write', 'delete', 'admin'
  conditions?: AccessCondition[];
}

// Примеры правил доступа:
// - Parent: read own children, write reports, read assigned exercises
// - Specialist: read/write routes for assigned children, read templates
// - Supervisor: read all routes, review reports, manage templates
// - Admin: full access to all resources
```

**Row-Level Security (NEW):**
```sql
-- Пример RLS политики для routes
CREATE POLICY specialist_own_routes ON route
  FOR SELECT
  USING (
    lead_specialist_id = current_user_id() OR
    EXISTS (
      SELECT 1 FROM route_phases
      WHERE route_id = route.id
      AND responsible_specialist_id = current_user_id()
    )
  );

-- Родители видят только своих детей
CREATE POLICY parent_own_children ON child
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children_parents
      WHERE child_id = child.id
      AND parent_user_id = current_user_id()
    )
  );
```

**Аудит:**
- ✅ Логирование всех действий пользователей (`assignment_history`, event logs)
- ✅ Отслеживание доступа к данным (query logging с PII masking)
- ✅ Мониторинг подозрительной активности (failed auth attempts, unusual access patterns)
- ✅ Регулярные отчеты по безопасности (ежемесячные security audits)
- ✅ **NEW:** Immutable audit log в отдельной БД (prevent tampering)

### 7.4 Связанные артефакты

- `DATA_GOVERNANCE.md` — процессы DSAR, инциденты, ретеншн.
- `constitution.md` §8–§10 — требования безопасности, SLO и интеграционной изоляции.
- Security runbooks и playbooks (в разработке).
- Compliance отчеты и аудиты — ссылки добавляются после публикации.

---

## 8. ИНТЕГРАЦИИ

### 8.1 Внешние сервисы

**Email сервис:**
- SendGrid или аналогичный
- Шаблоны уведомлений
- Отслеживание доставки
- Управление подписками

**SMS Gateway:**
- Twilio или российский аналог
- Критические уведомления
- Двухфакторная аутентификация
- Отчеты о доставке

**Telegram Bot API:**
- Уведомления пользователям
- WebApp интеграция
- Команды бота
- Файловые операции

**Видеоконференции:**
- WebRTC для прямых звонков
- Интеграция с внешними сервисами (Zoom, Meet)
- Запись сессий (с согласия)
- Демонстрация экрана

### 8.2 API для партнеров

> **📖 Полная спецификация:** `API_CONTRACTS_MVP.md` (версия 0.6)
> **📊 Доменные события:** `DATA_MODEL_AND_EVENTS.md` Section 2 (36 событий)

**Публичный REST API:**
- ✅ RESTful API с полной документацией (OpenAPI 3.0)
- ✅ **12 микросервисов:** auth, diagnostics, route-orchestrator, exercises, assignments, reports, comms, analytics, templates, children, specialists, media-storage
- ✅ Аутентификация через API ключи (Bearer token)
- ✅ Rate limiting (см. `API_CONTRACTS_MVP.md` Section 1.6):
  - 100 req/min для authenticated users
  - 10 req/min для anonymous
- ✅ Версионирование API через URL (`/api/v1/...`)
- ✅ Формат ошибок по RFC 7807 (Problem Details)

**tRPC для внутренних сервисов:**
```typescript
// См. API_CONTRACTS_MVP.md Section 13
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  children: childrenRouter,
  diagnostics: diagnosticsRouter,
  routes: routesRouter,
  exercises: exercisesRouter,
  assignments: assignmentsRouter,
  reports: reportsRouter,
  templates: templatesRouter,
  comms: commsRouter,
  analytics: analyticsRouter,
  media: mediaRouter,
});
```

**Webhook система (Event-Driven Architecture):**
- ✅ Уведомления о 36 доменных событиях
- ✅ Настраиваемые эндпоинты партнёров
- ✅ Retry механизм (exponential backoff: 1s, 2s, 4s, 8s, 16s)
- ✅ Безопасность webhook'ов (HMAC signature validation)
- ✅ **Outbox Pattern** для exactly-once delivery (см. `event_outbox` в БД)
- ✅ Event tracing через correlation_id + causation_id

### 8.3 Связанные артефакты

- `API_CONTRACTS_MVP.md` — описание REST/tRPC интерфейсов и схемы авторизации.
- `DATA_MODEL_AND_EVENTS.md` §2 — события для интеграций и уведомлений.
- Integration playbook (раздел в Confluence/Notion) — SLA провайдеров, контакты.
- `constitution.md` §11 — политика изоляции внешних зависимостей.

---

## 9. ИНФРАСТРУКТУРА И ЭКСПЛУАТАЦИЯ

### 9.1 Локальная разработка

Все сервисы и автоматические тесты запускаются внутри Docker/Compose-контейнеров. Нативный запуск вне контейнеров запрещён, если не оформлено явное исключение; локальный workflow использует те же образы, что и CI.

**Docker Compose setup:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/neiro
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=neiro
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### 9.2 Продакшен инфраструктура

**Kubernetes кластер:**
- Минимум 3 ноды для высокой доступности
- Auto-scaling на основе нагрузки
- Load balancing
- Health checks

**Мониторинг:**
- Prometheus + Grafana для метрик
- ELK Stack для логов
- Alertmanager для уведомлений
- Uptime monitoring

**Backup стратегия:**
- Ежедневные бэкапы БД
- Репликация в другой регион
- Тестирование восстановления
- Retention policy

### 9.3 CI/CD Pipeline

**GitHub Actions workflow:**
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: docker compose -f docker-compose.ci.yml run --rm backend npm test
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: docker build -t neiro:${{ github.sha }} .
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: kubectl apply -f k8s/
```

> Все стадии пайплайна используют контейнеры: тесты запускаются через `docker compose run`, сборка создаёт образы `docker build`, деплой публикует обновлённые контейнеры в кластер.

### 9.4 Связанные артефакты

- `constitution.md` §12–§13 — требования к контейнерам и процессам разработки.
- IaC репозитории (Terraform/Helm) — ссылки добавляются по мере публикации.
- Runbook эксплуатации и мониторинга — готовится командой DevOps.
- Observability dashboards (Grafana, Loki) — список URL хранится в `operations/README.md`.

---

## 10. ПУТЬ К ПРОДАКШЕНУ

### 10.1 MVP (Минимально жизнеспособный продукт) - 3 месяца

**Месяц 1: Основа**
- Настройка инфраструктуры разработки
- Базовая аутентификация и авторизация
- Профили пользователей и детей
- Простой диагностический модуль (M-CHAT)

**Месяц 2: Основной функционал**
- Система коррекционных маршрутов
- Базовая библиотека упражнений
- Система назначений и отчетов
- Простой чат между пользователями

**Месяц 3: Полировка**
- Мобильная версия (PWA)
- Базовые отчеты и аналитика
- Telegram Bot интеграция
- Тестирование и багфиксы

### 10.2 Расширенная версия - 2 месяца

**Месяц 4: Расширения**
- Дополнительные опросники
- Видеоконсультации
- Расширенная аналитика
- Система уведомлений

**Месяц 5: Оптимизация**
- Производительность и масштабирование
- Расширенная безопасность
- Дополнительные интеграции
- Финальное тестирование

### 10.3 Полная версия - 1 месяц

**Месяц 6: Финализация**
- Административная панель
- Расширенные отчеты
- API для партнеров
- Подготовка к запуску

### 10.4 Связанные артефакты

- Roadmap в Jira/Linear — ссылка добавляется по мере обновления.
- Quarterly planning deck — презентации для стейкхолдеров.
- Sprint planning/retro документы — `processes/agile/`.
- Release checklist — `processes/release.md`.

---

## 11. КРИТЕРИИ ПРИЕМКИ

### 11.1 Функциональные критерии

**Обязательные функции:**
- ✅ Регистрация и аутентификация всех типов пользователей
- ✅ Создание и управление профилями детей
- ✅ Прохождение диагностических опросников
- ✅ Создание и управление коррекционными маршрутами
- ✅ Назначение и выполнение упражнений
- ✅ Система отчетов и обратной связи
- ✅ Базовые коммуникации между пользователями

**Желательные функции:**
- 🔄 Видеоконсультации
- 🔄 Расширенная аналитика
- 🔄 Мобильное приложение
- 🔄 Telegram Bot
- 🔄 Интеграции с внешними сервисами

### 11.2 Технические критерии

**Производительность:**
- Время загрузки < 2 секунд
- API отклик < 500ms
- Поддержка 100+ одновременных пользователей
- Uptime > 99%

**Безопасность:**
- HTTPS на всех соединениях
- Защита от основных уязвимостей (OWASP Top 10)
- Шифрование чувствительных данных
- Аудит действий пользователей

**Совместимость:**
- Работа в основных браузерах
- Адаптивность под мобильные устройства
- Соответствие стандартам доступности

### 11.3 Качество кода

**Стандарты:**
- TypeScript для типизации
- ESLint + Prettier для форматирования
- Unit тесты для критических функций
- E2E тесты для основных сценариев
- Code review для всех изменений

**Документация:**
- README с инструкциями по запуску
- API документация (см. `API_CONTRACTS_MVP.md` v0.6)
- Комментарии в коде
- Архитектурная документация
- **✅ Модель данных:** `DATA_MODEL_AND_EVENTS.md` v0.2
  - Полные SQL DDL миграции для 27 таблиц
  - 10 систематизированных Constitution Check правил
  - 36 доменных событий с трассировкой (correlation_id, causation_id)
  - JSON-схемы для JSONB полей
- **✅ Дизайн-система:** `DESIGN_SYSTEM.md` с 50+ компонентами
- **✅ UI-Kit:** `UI_KIT.md` с практическими примерами

### 11.4 Связанные артефакты

- QA/Test Plans — TestRail/Playwright репозитории (ссылки добавляются по мере готовности).
- `qa/checklists.md` — чек-листы регресса и smoke.
- `processes/delivery.md` — Definition of Ready / Definition of Done.
- Release report template — `processes/release.md`.

---

## ЗАКЛЮЧЕНИЕ

Данное техническое задание описывает комплексную платформу для нейропсихологического сопровождения детей с РАС. Система объединяет современные веб-технологии с проверенными методиками коррекционной работы.

**Ключевые преимущества решения:**
- Индивидуальный подход к каждому ребенку
- Автоматизация рутинных процессов
- Удаленное сопровождение без потери качества
- Объективная оценка прогресса
- Масштабируемость и гибкость

**Ожидаемые результаты:**
- Повышение эффективности коррекционной работы на 40%
- Сокращение времени на административные задачи на 60%
- Улучшение качества жизни семей
- Стандартизация подходов к терапии

Проект готов к поэтапной реализации с учетом потребностей целевой аудитории и возможностей технической инфраструктуры.

### Статус готовности документации

**Подготовленные артефакты (октябрь 2025):**

| Документ | Версия | Статус | Описание |
|----------|--------|--------|----------|
| `DATA_MODEL_AND_EVENTS.md` | 0.2 | ✅ Готов | 27 таблиц с SQL DDL, 10 бизнес-правил, 36 событий |
| `API_CONTRACTS_MVP.md` | 0.6 | ✅ Готов | 12 сервисов, Webhook API, tRPC namespace, roadmap интеграции |
| `DESIGN_SYSTEM.md` | 1.0 | ✅ Готов | Цвета, типографика, 50+ компонентов, accessibility |
| `UI_KIT.md` | 1.0 | ✅ Готов | Практические примеры, композитные паттерны |
| `Neiro_CJM_Extended.md` | 1.0 | ✅ Готов | 12 детализированных Customer Journey Maps |
| `neiro.md` | 1.0 | ✅ Готов | Спецификация платформы, архитектура |

**Следующие этапы:**
- Разработка Prisma Schema на основе SQL DDL
- Настройка Event Streaming Infrastructure (Outbox Pattern)
- Реализация Constitution Check валидаторов
- Подготовка тестовых seeders для БД

---

**Документ подготовлен:** Команда разработки Neiro
**Версия:** 3.1
**Дата:** 28 октября 2025
**Статус:** Утвержден для разработки
**Следующий пересмотр:** По завершении MVP

---

*Данное техническое задание является живым документом и будет обновляться по мере развития проекта и получения обратной связи от заказчика.*
