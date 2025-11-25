# Gmail SMTP Setup для Neiro Platform

**Дата:** 2025-11-25
**Статус:** Инструкция для настройки
**Время:** 10-15 минут

---

## 📧 Зачем это нужно?

Gmail SMTP позволяет отправлять email уведомления из Neiro Platform:
- ✅ Напоминания о заданиях
- ✅ Уведомления о проверке отчетов
- ✅ Достижения целей
- ✅ Обновления маршрутов

---

## 🔧 Шаг 1: Получить App Password в Gmail

### 1.1. Включить 2-Step Verification (если еще не включена)

1. Перейти на: https://myaccount.google.com/
2. Слева выбрать **"Security"**
3. Найти **"2-Step Verification"**
4. Если не включена - нажать **"Get Started"** и следовать инструкциям
5. Подтвердить через SMS или Google Authenticator

### 1.2. Создать App Password

1. Перейти на: https://myaccount.google.com/apppasswords

   Или:
   - Google Account → **Security**
   - Прокрутить вниз до **"2-Step Verification"**
   - Внизу секции найти **"App passwords"**

2. Нажать **"Select app"** → выбрать **"Mail"**

3. Нажать **"Select device"** → выбрать **"Other (Custom name)"**

4. Ввести название: **"Neiro Platform"**

5. Нажать **"Generate"**

6. **ВАЖНО:** Скопировать 16-значный пароль!
   ```
   Пример: abcd efgh ijkl mnop
   hles mwlr swxt rnpl

   ```

7. **Сохранить этот пароль** - он больше не будет показан!

---

## 🔐 Шаг 2: Обновить .env файл

### 2.1. Открыть файл .env

```bash
cd /Users/andreyafanasyev/Projects/Platform/nero_platform
nano .env  # или code .env
```

### 2.2. Найти секцию Email Delivery

Найти строки:
```bash
# ============================================================
# Email Delivery (Week 3 - Notifications)
# ============================================================
# SMTP Configuration (Gmail for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM_EMAIL=noreply@neiro.dev
SMTP_FROM_NAME=Neiro Platform
```

### 2.3. Заменить значения

**Заменить:**
- `SMTP_USER=your-email@gmail.com` → **ваш Gmail адрес**
- `SMTP_PASS=your-16-char-app-password` → **App Password из шага 1.2**

**Пример:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=andrey.afanasyev@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=noreply@neiro.dev
SMTP_FROM_NAME=Neiro Platform
```

### 2.4. Сохранить файл

- Nano: `Ctrl+X`, затем `Y`, затем `Enter`
- VS Code: `Cmd+S`

---

## ✅ Шаг 3: Протестировать SMTP соединение

### 3.1. Установить зависимости (если еще не установлены)

```bash
cd /Users/andreyafanasyev/Projects/Platform/nero_platform
npm install nodemailer @types/nodemailer dotenv
```

### 3.2. Запустить тест

```bash
npx ts-node scripts/test-smtp.ts
```

### 3.3. Ожидаемый результат

**Успешный тест:**
```
🔧 Testing SMTP Configuration...

Configuration:
  Host: smtp.gmail.com
  Port: 587
  Secure: false
  User: andrey.afanasyev@gmail.com
  Pass: ****************

Step 1: Verifying SMTP connection...
✅ SMTP connection verified!

Step 2: Sending test email...
✅ Test email sent successfully!
  Message ID: <...@gmail.com>
  Recipient: andrey.afanasyev@gmail.com

🎉 SMTP configuration is working correctly!

Next steps:
  1. Check your inbox for the test email
  2. If not received, check spam folder
  3. You can now use this SMTP configuration in Week 3 Notifications Service
```

### 3.4. Проверить почту

1. Открыть Gmail: https://mail.google.com/
2. Найти письмо с темой: **"✅ Neiro Platform - SMTP Test Email"**
3. Если не найдено - проверить **Spam** папку

---

## ❌ Troubleshooting (если тест провалился)

### Ошибка: Authentication Error (EAUTH)

**Причина:** Неверный email или App Password

**Решение:**
1. Проверить `SMTP_USER` - должен быть полный Gmail адрес
2. Проверить `SMTP_PASS` - должен быть App Password (16 символов)
3. **НЕ использовать** обычный пароль от Gmail!
4. Убрать пробелы из App Password (писать слитно: `abcdefghijklmnop`)

### Ошибка: Connection Error (ECONNECTION/ETIMEDOUT)

**Причина:** Не удается подключиться к smtp.gmail.com

**Решение:**
1. Проверить интернет-соединение
2. Проверить firewall (должен разрешать порт 587)
3. Проверить VPN (иногда блокирует SMTP)
4. Попробовать другую сеть Wi-Fi

### Ошибка: 2-Step Verification не включена

**Причина:** Gmail требует 2FA для App Passwords

**Решение:**
1. Включить 2-Step Verification (см. Шаг 1.1)
2. Только после этого можно создать App Password

---

## 📋 Checklist для проверки

- [ ] 2-Step Verification включена в Google Account
- [ ] App Password сгенерирован (16 символов)
- [ ] SMTP_USER обновлён в .env (полный email)
- [ ] SMTP_PASS обновлён в .env (App Password без пробелов)
- [ ] Тест `npx ts-node scripts/test-smtp.ts` прошел успешно
- [ ] Тестовое письмо получено в Gmail inbox (или spam)

---

## 🔒 Безопасность

**ВАЖНО:**

1. ❌ **НЕ коммитить** `.env` файл в git!
   - Файл уже в `.gitignore`
   - App Password = доступ к вашему Gmail!

2. ✅ **Использовать** `.env.example` для шаблонов
   - Там только примеры значений
   - Безопасно коммитить в git

3. 🔄 **Ротация паролей**
   - Можно отозвать App Password: https://myaccount.google.com/apppasswords
   - Сгенерировать новый если старый скомпрометирован

4. 📧 **Ограничения Gmail**
   - **Лимит:** 500 писем в день (для бесплатного аккаунта)
   - **Rate limit:** ~20 писем в минуту
   - Для production → использовать SendGrid (см. ниже)

---

## 🚀 Production: SendGrid (опционально)

Для production окружения рекомендуется SendGrid:

### Преимущества:
- ✅ Нет лимитов (платные планы: 100K+ писем/месяц)
- ✅ Email templates с переменными
- ✅ Analytics (open rate, click rate)
- ✅ Webhooks для событий (bounced, delivered, opened)
- ✅ Verified domain (не попадает в spam)

### Настройка (5 минут):

1. **Зарегистрироваться:** https://signup.sendgrid.com/
   - Free tier: 100 emails/day

2. **Создать API Key:**
   - Settings → API Keys → Create API Key
   - Name: "Neiro Platform"
   - Permissions: "Full Access" или "Mail Send"
   - Скопировать API Key (начинается с `SG.`)

3. **Verify Domain или Sender:**
   - Settings → Sender Authentication
   - Verify Single Sender: `noreply@neiro.dev`

4. **Обновить .env:**
   ```bash
   # Закомментировать SMTP переменные
   # SMTP_HOST=smtp.gmail.com
   # ...

   # Раскомментировать SendGrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@neiro.dev
   SENDGRID_FROM_NAME=Neiro Platform
   ```

5. **Тест:**
   ```bash
   npx ts-node scripts/test-sendgrid.ts  # TODO: создать этот скрипт
   ```

---

## 📚 Ресурсы

- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833
- **Gmail SMTP Settings:** https://support.google.com/mail/answer/7126229
- **Nodemailer Docs:** https://nodemailer.com/
- **SendGrid Docs:** https://docs.sendgrid.com/

---

## 🎯 Следующие шаги

После успешной настройки Gmail SMTP:

1. ✅ **Week 3 - Task 3.1.2:** Email Templates
   - Создать шаблоны для уведомлений
   - Интегрировать Nodemailer в Notifications Service

2. ✅ **Week 3 - Task 3.1.4:** EventOutbox Consumers
   - Слушать события `reports.report.submitted`
   - Отправлять email через SMTP

3. ✅ **Week 3 - Task 3.4:** Delivery Monitoring
   - Логировать успешные отправки
   - Retry для failed emails

---

**Автор:** Claude Code
**Дата:** 2025-11-25
**Версия:** 1.0
