# Neiro Platform

Единая цифровая платформа для нейропсихологического сопровождения детей с РАС. Проект обеспечивает непрерывную диагностику, планирование и выполнение коррекционных маршрутов, коммуникацию участников и контроль эффективности.

## Описание решения

Neiro решает задачу координации клинической команды и семьи в едином цифровом пространстве: специалисты проводят диагностику, формируют маршруты, назначают занятия, а родители фиксируют результаты и получают поддержку. Полное описание требований, ролей и процессов представлено в документе Single Source of Truth — [`Documents/ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md`](Documents/ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md).

Ключевые отличия платформы — интегрированная карта ребёнка с трассировкой всех данных, гибкий конструктор маршрутов с проверкой клинических ограничений, автоматизированные назначения с календарями, аналитические дашборды «до/после», встроенная коммуникация (чат, видео, чек-листы) и защищённое хранилище материалов. Эти возможности собраны в `Documents/Neiro_platform_specialist_overview.md` и поддерживают ежедневную работу нейропсихологов, логопедов, неврологов и других специалистов.

## Навигация

- [Архитектура](#архитектура) — стек и сервисы
- [Ключевые модули](#ключевые-модули) — ссылки на профильные артефакты
- [Быстрый старт (MVP)](#быстрый-старт-mvp) — отправная точка для разработки
- [Обновление документации](#обновление-документации) — правила работы с SoT
- [Соответствие и безопасность](#соответствие-и-безопасность) — регуляторика и контроль
- [Roadmap & задачи](#roadmap--задачи) — планы и текущие инициативы
- [Контакты команд](#контакты-команд) — владельцы направлений

## Архитектура

- **Frontend / BFF:** Next.js 14+ (App Router, TypeScript, Tailwind CSS, Radix UI, React Hook Form, PWA поддержка)  
- **Backend сервисы:** микросервисная модель на Node.js/TypeScript (auth, diagnostics, route-orchestrator, exercises, assignments, reports, analytics, comms, templates, specialists, media, webhooks, security)  
- **Хранение данных:** PostgreSQL, MinIO (S3), Redis  
- **Интеграции:** Telegram WebApp, email/SMS, видеосвязь (WebRTC), внешний webhook-шлюз  
- **Событийность:** доменные события по конвенциям `DATA_MODEL_AND_EVENTS.md`, публикация через очереди Redis  
- **Инфраструктура:** Docker/Compose для разработки, CI/CD в контейнерах, Vercel (Next.js), Kubernetes для продакшена

## Ключевые модули

| Модуль | Назначение | Документ |
| --- | --- | --- |
| Коррекционные маршруты | Построение, адаптация и супервизия маршрутов | `Documents/Correction_route.md` |
| Бизнес-процессы | Регламенты BP-01…BP-09, KPI, события | `Documents/BUSINESS_PROCESSES_AND_WORKFLOWS.md` |
| API контракты | REST/tRPC схемы (v0.6), Webhook, Security | `Documents/API_CONTRACTS_MVP.md` |
| Модель данных | ERD, конституционные правила, события | `Documents/DATA_MODEL_AND_EVENTS.md` |
| Design System | Принципы, палитра, компоненты | `Documents/DESIGN_SYSTEM.md` |
| UI Kit | Реализация и паттерны компонентов | `Documents/UI_KIT.md` |
| Data Governance | Политики GDPR/152-ФЗ/HIPAA | `Documents/DATA_GOVERNANCE.md` |
| CJM | Customer Journey Maps (v1.2) | `Documents/Neiro_CJM_Extended.md` |
| SoT | Единая точка правды и вагонообразная таблица статусов | `Documents/ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md` |

## Быстрый старт (MVP)



## Обновление документации

1. Любые изменения требований оформляйте через SoT (`Documents/ТЕХНИЧЕСКОЕ_ЗАДАНИЕ_NEIRO_PLATFORM.md`).  
2. Следуйте регламенту `Documents/DOCUMENTATION_UPDATE_GUIDELINE.md`: согласование владельцев разделов, обновление версий, Constitution Check.  
3. Сопутствующие артефакты (API, ERD, CJM) синхронизируются ссылками и changelog.

## Соответствие и безопасность

- Security & Compliance API (см. `API_CONTRACTS_MVP.md` §14) реализует логи, DSAR, ретеншн, инциденты.  
- Политики хранения и инцидент-менеджмент описаны в `DATA_GOVERNANCE.md`.  
- Конституционные Gate'ы (Stack, Service Boundaries, Data Policy и др.) обязательны для всех фич.

## Roadmap & задачи

- Текущие фичи и миграции: `neiro-nextjs/docs/MIGRATION_PLAN.md`, `neiro-nextjs/docs/TASKS.md`.  
- Roadmap-интеграции (Telegram, WebRTC, Gamification, Offline Sync) указаны в `API_CONTRACTS_MVP.md` §17 и будут включены после стабилизации MVP.

## Контакты команд

- **Product / CJM:** Product Lead  
- **Clinical & Route Modules:** Head of Clinical Operations  
- **Engineering / Architecture:** Lead Engineer  
- **Security & Compliance:** Security Officer, DPO  
- **Design:** Design Lead / UI Team  

Назначения владельцев артефактов фиксируются в таблице статусов SoT.
