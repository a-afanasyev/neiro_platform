# Project Context

## Описание
Neiro Platform — платформа для нейропсихологического сопровождения детей с РАС (Расстройства Аутистического Спектра). Позволяет специалистам создавать маршруты развития, назначать упражнения, а родителям — выполнять их и отслеживать прогресс.

## Технологический стек
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend:** Node.js, Express (Микросервисы).
- **Database:** PostgreSQL 15, Prisma ORM.
- **Messaging:** Redis (для событий и кэша).
- **Containerization:** Docker, Docker Compose.
- **Monorepo:** TurboRepo.

## Структура сервисов
1. **Auth (4001):** Авторизация, JWT.
2. **Users (4002):** Управление пользователями и ролями.
3. **Children (4003):** Профили детей, связи с родителями/специалистами.
4. **Diagnostics (4004):** Опросники (CARS, ABC, ATEC), сессии.
5. **Routes (4005):** Маршруты развития, фазы, цели.
6. **Assignments (4006):** Календарь назначений, выполнение.
7. **Exercises (4007):** Библиотека упражнений.
8. **Templates (4008):** Шаблоны маршрутов.

## Ключевые документы
- `nero_platform/Documents/MONTH_1_2_TECH_DEBT_PLAN.md`: Основной план работ.
- `nero_platform/Documents/API_CONTRACTS_MVP.md`: Контракты API.
- `nero_platform/Documents/DATA_MODEL_AND_EVENTS.md`: Модель данных.

