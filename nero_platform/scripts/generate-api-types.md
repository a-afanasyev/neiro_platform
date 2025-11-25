# API Types Generation Strategy

## Цель
Автоматическая генерация TypeScript типов из API_CONTRACTS_MVP.md для обеспечения type safety между frontend и backend.

## Подход

### Вариант 1: Ручная поддержка типов (текущий)
**Статус:** Используется сейчас
**Преимущества:**
- Полный контроль над типами
- Нет зависимостей от внешних инструментов
- Простота понимания

**Недостатки:**
- Риск рассинхронизации с API контрактами
- Ручное обновление при изменениях API

### Вариант 2: OpenAPI + code generation (рекомендуется для Month 3+)
**Инструменты:**
- `openapi-typescript` - генерация TS типов из OpenAPI схемы
- `zod` + `@anatine/zod-openapi` - runtime validation

**Шаги реализации:**

#### Шаг 1: Создать OpenAPI спецификацию
```bash
# Создать openapi.yaml на основе API_CONTRACTS_MVP.md
# Размещение: Documents/openapi.yaml
```

#### Шаг 2: Установить зависимости
```bash
pnpm add -D openapi-typescript
pnpm add zod @anatine/zod-openapi
```

#### Шаг 3: Добавить npm скрипт
```json
{
  "scripts": {
    "types:generate": "openapi-typescript ../Documents/openapi.yaml -o packages/types/src/generated/api.ts",
    "types:validate": "node scripts/validate-api-contracts.js"
  }
}
```

#### Шаг 4: Настроить CI/CD validation
```yaml
# .github/workflows/api-validation.yml
name: API Contract Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm types:generate
      - run: pnpm types:validate
```

## Текущая стратегия для Month 3

Для Month 3 рекомендуется **гибридный подход**:

1. **Сохранить существующие типы** в `packages/types/src/`
2. **Добавить runtime validation** с Zod для критичных endpoints
3. **Добавить documentation tests** - проверка примеров из API_CONTRACTS_MVP.md

### Приоритетные endpoints для validation:
- POST /reports/v1 (критичные поля)
- POST /reports/v1/:id/review
- GET /user-notifications/v1
- PATCH /notification-preferences/v1
- GET /analytics/v1/children/:childId/progress

## Реализация для Week 1

### Задача: Добавить Zod schemas для Reports API

```typescript
// packages/types/src/schemas/reports.ts
import { z } from 'zod';

export const CreateReportSchema = z.object({
  assignmentId: z.string().uuid(),
  durationMinutes: z.number().int().min(1).max(180),
  status: z.enum(['completed', 'partial', 'failed']),
  childMood: z.enum(['good', 'neutral', 'difficult']),
  feedbackText: z.string().max(1024).optional(),
  media: z.array(z.object({
    mediaId: z.string().uuid(),
    type: z.enum(['photo', 'video', 'audio']),
    url: z.string().url(),
    durationSeconds: z.number().int().min(0).optional(),
  })).max(5).optional(),
});

export type CreateReportRequest = z.infer<typeof CreateReportSchema>;
```

### Использование в коде:

```typescript
// В API route handler
const result = CreateReportSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error });
}

// result.data теперь type-safe
const report = await reportsService.create(result.data);
```

## Timeline

- **Week 1 (Reports):** Добавить Zod schemas для Reports API
- **Week 2 (Analytics):** Добавить Zod schemas для Analytics API
- **Week 3 (Notifications):** Добавить Zod schemas для Notifications API
- **Week 4 (Integration):** Настроить CI/CD validation

## Метрики успеха

- ✅ 100% критичных endpoints покрыты Zod schemas
- ✅ 0 runtime type errors в production
- ✅ CI/CD автоматически валидирует контракты
- ✅ Документация синхронизирована с кодом

---

**Создано:** 22 ноября 2025
**Автор:** Claude Code
**Статус:** Рекомендации для команды
