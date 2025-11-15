# 🔧 Ручное применение миграции для Assignment.specialistId

**Дата:** 2025-11-15  
**Проблема:** Prisma engine ошибка при автоматической миграции  
**Решение:** Применить изменения вручную через SQL

---

## ⚠️ Проблема

При попытке применить миграцию возникла ошибка Prisma engine:

```
Error: Could not parse schema engine response: 
SyntaxError: Unexpected token 'E', "Error load"... is not valid JSON
```

**Причина:** Проблема с Prisma engine в Alpine контейнере (известная проблема с OpenSSL).

---

## ✅ Решение

Применить изменения вручную через SQL.

### Шаг 1: Проверить текущую структуру таблицы

```bash
docker-compose exec postgres psql -U neiro_user -d neiro_platform \
  -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assignments' ORDER BY ordinal_position;"
```

### Шаг 2: Добавить колонку specialist_id (если её нет)

```sql
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS specialist_id UUID NOT NULL;
```

**Примечание:** Если таблица пустая, это сработает сразу. Если есть данные, нужно:

1. Добавить колонку как nullable:
```sql
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS specialist_id UUID;
```

2. Заполнить данные (например, копировать из assigned_by_id):
```sql
UPDATE assignments 
SET specialist_id = (
  SELECT user_id FROM specialist 
  WHERE specialist.user_id = assignments.assigned_by_id
  LIMIT 1
)
WHERE specialist_id IS NULL;
```

3. Сделать колонку NOT NULL:
```sql
ALTER TABLE assignments 
ALTER COLUMN specialist_id SET NOT NULL;
```

### Шаг 3: Добавить Foreign Key constraint

```sql
ALTER TABLE assignments
ADD CONSTRAINT assignments_specialist_id_fkey 
FOREIGN KEY (specialist_id) 
REFERENCES specialist(user_id) 
ON DELETE RESTRICT;
```

### Шаг 4: Проверить результат

```sql
\d assignments
```

Должна появиться колонка `specialist_id` с FK constraint.

---

## 🚀 Полная команда для применения

Если таблица `assignments` пуста (seed еще не запускался):

```bash
docker-compose exec postgres psql -U neiro_user -d neiro_platform <<EOF
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS specialist_id UUID NOT NULL;

ALTER TABLE assignments
ADD CONSTRAINT IF NOT EXISTS assignments_specialist_id_fkey 
FOREIGN KEY (specialist_id) 
REFERENCES specialist(user_id) 
ON DELETE RESTRICT;
EOF
```

---

## 📋 Проверка

После применения миграции:

```bash
# Проверить структуру таблицы
docker-compose exec postgres psql -U neiro_user -d neiro_platform -c "\d assignments"

# Проверить FK constraints
docker-compose exec postgres psql -U neiro_user -d neiro_platform -c "
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='assignments'
ORDER BY tc.table_name;
"
```

---

## 🔄 После успешного применения

1. ✅ Prisma Client уже сгенерирован (выполнено ранее)
2. ⏳ Обновить seed script для использования `specialistId`
3. ⏳ Запустить seed
4. ⏳ Протестировать

---

## 🛠️ Альтернативный подход

Если хотите использовать Prisma миграции в будущем, можно:

1. Обновить Prisma до последней версии:
```bash
docker-compose exec app pnpm add -D prisma@latest @prisma/client@latest
```

2. Пересобрать контейнер с правильными OpenSSL библиотеками в Dockerfile.dev

---

**Статус:** ⏳ Ожидает ручного применения SQL  
**Файлы изменены:** `packages/database/prisma/schema.prisma`  
**Prisma Client:** ✅ Сгенерирован

