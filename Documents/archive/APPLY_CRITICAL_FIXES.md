# 🚨 Применение критических исправлений

**Дата:** 14 ноября 2025  
**Версия:** 0.3.1 (security patch)

---

## ⚠️ КРИТИЧНО: Прочитайте перед продолжением!

Были обнаружены и исправлены **2 критические проблемы безопасности**:

1. ❌ **Отсутствие проверки пароля** - любой мог войти без пароля
2. ❌ **Несоответствие refresh token API** - runtime error при обновлении токена

Все исправления уже внесены в код. **Необходимо применить изменения в БД.**

---

## 🚀 Быстрое применение (5 минут)

### Шаг 1: Остановить сервисы
```bash
cd nero_platform

# Остановить только app сервисы (БД оставить работать)
docker-compose stop app
```

### Шаг 2: Создать миграцию
```bash
# Создать миграцию для добавления поля password
docker-compose exec app pnpm --filter @neiro/database prisma migrate dev --name add_password_field

# Если контейнер остановлен, запустите его:
docker-compose up -d app
docker-compose exec app pnpm --filter @neiro/database prisma migrate dev --name add_password_field
```

### Шаг 3: Применить миграцию
```bash
docker-compose exec app pnpm run db:migrate
```

### Шаг 4: Заполнить БД с паролями
```bash
# ВАЖНО: Это пересоздаст всех пользователей с паролями
docker-compose exec app pnpm run db:seed
```

### Шаг 5: Перезапустить сервисы
```bash
docker-compose restart

# Проверить статус
docker-compose ps
```

### Шаг 6: Проверить работоспособность
```bash
# Открыть в браузере
open http://localhost:3001/login

# Войти с тестовым аккаунтом:
# Email: admin@neiro.dev
# Password: admin123
```

---

## ✅ Проверка исправлений

### Тест 1: Неправильный пароль отклоняется
```bash
curl -X POST http://localhost:4001/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neiro.dev","password":"wrongpassword"}'
```

**Ожидаемый результат:**
```json
{
  "success": false,
  "error": {
    "message": "Неверный email или пароль",
    "code": "INVALID_CREDENTIALS",
    "status": 401
  }
}
```

### Тест 2: Правильный пароль работает
```bash
curl -X POST http://localhost:4001/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neiro.dev","password":"admin123"}'
```

**Ожидаемый результат:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900,
  "user": {
    "id": "...",
    "email": "admin@neiro.dev",
    "role": "admin"
  }
}
```

### Тест 3: Refresh token работает
```bash
# Сначала получите токены из теста 2, затем:
curl -X POST http://localhost:4001/auth/v1/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"ВАЫШ_REFRESH_TOKEN"}'
```

**Ожидаемый результат:**
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

---

## 🔄 Альтернативный метод (полная пересборка)

Если хотите начать с чистого листа:

```bash
# 1. Остановить и удалить всё (ВНИМАНИЕ: удалит все данные!)
docker-compose down -v

# 2. Запустить заново
docker-compose up -d

# 3. Установить зависимости
docker-compose exec app pnpm install

# 4. Сгенерировать Prisma Client
docker-compose exec app pnpm run db:generate

# 5. Применить миграции
docker-compose exec app pnpm run db:migrate

# 6. Заполнить БД
docker-compose exec app pnpm run db:seed

# 7. Запустить сервисы
docker-compose exec app pnpm --filter @neiro/auth dev &
docker-compose exec app pnpm --filter @neiro/users dev &
docker-compose exec app pnpm --filter @neiro/children dev &
docker-compose exec app pnpm --filter @neiro/diagnostics dev &
docker-compose exec app pnpm --filter @neiro/web dev &
```

---

## 📝 Новые пароли тестовых аккаунтов

После применения исправлений используйте эти пароли:

| Email | Роль | Пароль |
|-------|------|--------|
| admin@neiro.dev | Администратор | **admin123** |
| supervisor@neiro.dev | Супервизор | **supervisor123** |
| neuro@neiro.dev | Нейропсихолог | **neuro123** |
| speech@neiro.dev | Логопед | **speech123** |
| aba@neiro.dev | ABA-терапевт | **aba123** |
| parent1@example.com | Родитель 1 | **parent123** |
| parent2@example.com | Родитель 2 | **parent123** |

**Все пароли хешированы через bcrypt с 12 rounds.**

---

## 🐛 Troubleshooting

### Проблема: Migration failed
```bash
# Сбросить миграции и начать заново
docker-compose exec app npx prisma migrate reset
docker-compose exec app pnpm run db:migrate
docker-compose exec app pnpm run db:seed
```

### Проблема: Seed failed - unique constraint violation
```bash
# Очистить БД и запустить seed снова
docker-compose exec app npx prisma migrate reset --force
docker-compose exec app pnpm run db:seed
```

### Проблема: Login не работает после исправлений
1. Проверьте, что миграция применена:
```bash
docker-compose exec app npx prisma migrate status
```

2. Проверьте, что поле password существует:
```bash
docker-compose exec postgres psql -U neiro_user -d neiro_platform -c "\d users"
```

3. Проверьте логи Auth Service:
```bash
docker-compose logs auth
```

### Проблема: Frontend показывает ошибку
1. Очистите localStorage в браузере:
```javascript
// В консоли браузера
localStorage.clear()
location.reload()
```

2. Проверьте, что frontend обновлен:
```bash
docker-compose restart app
```

---

## 📊 Что изменилось

### Изменённые файлы:

1. **packages/database/prisma/schema.prisma**
   - Добавлено поле `password String @db.VarChar(255)`

2. **services/auth/src/controllers/auth.controller.ts**
   - Активирована проверка пароля через bcrypt.compare()

3. **packages/database/prisma/seed.ts**
   - Добавлены хешированные пароли для всех пользователей

4. **apps/web/src/lib/api.ts**
   - Исправлена структура ответа refresh token endpoint

### Новые файлы:

1. **CRITICAL_FIXES.md** - детальное описание проблем
2. **APPLY_CRITICAL_FIXES.md** - эта инструкция

---

## ✅ Checklist после применения

- [ ] Миграция применена успешно
- [ ] Seed выполнен без ошибок
- [ ] Все сервисы запущены
- [ ] Login работает с правильным паролем
- [ ] Login отклоняет неправильный пароль
- [ ] Refresh token работает
- [ ] Frontend отображается корректно
- [ ] Можно создать ребенка
- [ ] Можно создать диагностику

---

## 🆘 Нужна помощь?

Если что-то не работает:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Перечитайте эту инструкцию
4. Свяжитесь с командой

---

**Дата:** 14 ноября 2025  
**Автор:** AI Assistant  
**Проверено:** Lead Engineer

