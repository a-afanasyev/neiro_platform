# 🔧 Исправление конфликта FK в модели Assignment

**Дата:** 2025-11-14  
**Проблема:** Конфликт Foreign Key в модели Assignment  
**Статус:** ✅ ИСПРАВЛЕНО

---

## 🐛 Проблема

В модели `Assignment` оба отношения использовали одно и то же поле `assignedById`:

```prisma
// ❌ БЫЛО (ошибка)
model Assignment {
  assignedById            String    @map("assigned_by_id") @db.Uuid
  
  // Relations
  assignedBy   User       @relation("AssignedBy", fields: [assignedById], references: [id])
  specialist   Specialist @relation("SpecialistAssignments", fields: [assignedById], references: [userId])  // ❌ Конфликт!
}
```

**Проблема:** 
- `assignedBy` использует `assignedById` → ссылается на `User.id` ✅
- `specialist` использует `assignedById` → ссылается на `Specialist.userId` ❌
- Оба отношения пытаются использовать одно поле для разных FK!

---

## ✅ Решение

Добавлено отдельное поле `specialistId` для отношения `specialist`:

```prisma
// ✅ СТАЛО (правильно)
model Assignment {
  assignedById            String    @map("assigned_by_id") @db.Uuid
  specialistId            String    @map("specialist_id") @db.Uuid  // ✅ Новое поле
  
  // Relations
  assignedBy   User       @relation("AssignedBy", fields: [assignedById], references: [id])
  specialist   Specialist @relation("SpecialistAssignments", fields: [specialistId], references: [userId])  // ✅ Использует specialistId
}
```

---

## 📝 Изменения

### Добавлено поле

```prisma
specialistId            String    @map("specialist_id") @db.Uuid
```

**Расположение:** После `assignedById` (строка 347)

### Исправлено отношение

```prisma
// Было:
specialist   Specialist @relation("SpecialistAssignments", fields: [assignedById], references: [userId])

// Стало:
specialist   Specialist @relation("SpecialistAssignments", fields: [specialistId], references: [userId])
```

**Расположение:** Строка 367

---

## 🗄️ Миграция базы данных

После этого исправления необходимо создать и применить миграцию:

```bash
# Внутри Docker контейнера
docker-compose exec app sh -c "cd packages/database && npx prisma migrate dev --name add_specialist_id_to_assignment"
```

**Что сделает миграция:**
1. Добавит колонку `specialist_id` в таблицу `assignments`
2. Заполнит `specialist_id` на основе существующих данных (если нужно)
3. Создаст Foreign Key constraint на `specialist_id → specialist.user_id`

---

## ⚠️ Важные заметки

### Логика полей

- **`assignedById`** → Кто назначил задание (может быть admin, supervisor, другой specialist)
- **`specialistId`** → Какой специалист отвечает за выполнение задания (ссылается на Specialist.userId)

### Обратная совместимость

Если в базе уже есть данные в таблице `assignments`, нужно:

1. **Вариант 1:** Заполнить `specialist_id` на основе `assigned_by_id` (если они совпадают)
2. **Вариант 2:** Оставить `specialist_id` NULL временно (но поле не nullable, поэтому нужна миграция с данными)

**Рекомендация:** Создать миграцию с заполнением данных:

```sql
-- В миграции
UPDATE assignments 
SET specialist_id = (
  SELECT id FROM specialist WHERE user_id = assignments.assigned_by_id
)
WHERE specialist_id IS NULL;
```

---

## ✅ Проверка

### Prisma Format

```bash
cd packages/database
npx prisma format
# ✅ Schema formatted successfully
```

### Prisma Validate

```bash
# Требует DATABASE_URL, но синтаксис проверен
npx prisma validate
```

### Проверка в коде

После применения миграции можно использовать:

```typescript
// Теперь можно обращаться к обоим полям
const assignment = await prisma.assignment.findUnique({
  where: { id },
  include: {
    assignedBy: true,    // User, который назначил
    specialist: true,    // Specialist, который выполняет
  }
})
```

---

## 📊 Влияние на код

### Backend Services

Нужно обновить код, который создает Assignment:

```typescript
// services/assignments/src/controllers/assignments.controller.ts
// (когда будет создан)

await prisma.assignment.create({
  data: {
    childId,
    exerciseId,
    assignedById: currentUser.id,      // Кто назначил
    specialistId: specialist.id,       // Кто выполняет (новое поле!)
    routeId,
    phaseId,
    // ...
  }
})
```

### Frontend

Если есть формы создания Assignment, нужно добавить поле для выбора специалиста.

---

## 🔗 Связанные модели

### User Model

```prisma
model User {
  assignedBy      Assignment[]       @relation("AssignedBy")  // Назначения, которые создал этот пользователь
}
```

### Specialist Model

```prisma
model Specialist {
  assignments    Assignment[]      @relation("SpecialistAssignments")  // Назначения для этого специалиста
}
```

---

## ✅ Статус

- [x] Поле `specialistId` добавлено
- [x] Отношение `specialist` исправлено
- [x] Prisma schema отформатирован
- [ ] Миграция создана (требуется выполнить)
- [ ] Миграция применена (требуется выполнить)
- [ ] Код обновлен для использования `specialistId`

---

**Файл:** `packages/database/prisma/schema.prisma`  
**Строки:** 347 (добавлено поле), 367 (исправлено отношение)  
**Статус:** ✅ ИСПРАВЛЕНО

