# 🔒 Security Patch 0.3.1

**Release Date:** 14 ноября 2025  
**Type:** CRITICAL SECURITY UPDATE  
**Severity:** 🔴 CRITICAL

---

## 🚨 Executive Summary

Два критических уязвимости безопасности были обнаружены и исправлены в версии 0.3.0:

1. **CVE-NEIRO-2025-001:** Отсутствие проверки пароля при аутентификации
2. **BUG-NEIRO-2025-002:** Несоответствие структуры ответа refresh token API

**Все уязвимости исправлены. Требуется немедленное применение патча.**

---

## 🔴 CVE-NEIRO-2025-001: Authentication Bypass

### Описание
Login endpoint не проверял пароль пользователя, позволяя доступ к любому аккаунту с знанием только email.

### CVSS Score
**10.0/10** (Maximum - Critical)

### Impact
- Полная компрометация системы
- Доступ к PII и медицинским данным детей
- Нарушение GDPR, 152-ФЗ, HIPAA

### Affected Versions
- 0.1.0 - 0.3.0

### Fixed in
- 0.3.1

### Changes
1. Добавлено поле `password` в модель User
2. Активирована проверка пароля через bcrypt.compare()
3. Обновлен seed с хешированными паролями

**Files Modified:**
- `packages/database/prisma/schema.prisma`
- `services/auth/src/controllers/auth.controller.ts`
- `packages/database/prisma/seed.ts`

---

## ⚠️ BUG-NEIRO-2025-002: Refresh Token API Mismatch

### Описание
Frontend ожидал `response.data.data`, но backend возвращал в `response.data`, вызывая runtime error.

### Severity
**Medium** (не критично для безопасности, но ломает UX)

### Impact
- Automatic logout при истечении access token
- Плохой UX

### Affected Versions
- 0.1.0 - 0.3.0

### Fixed in
- 0.3.1

### Changes
Исправлена деструктуризация в response interceptor:

```typescript
// БЫЛО:
const { accessToken, refreshToken: newRefreshToken } = response.data.data

// СТАЛО:
const { accessToken } = response.data
```

**Files Modified:**
- `apps/web/src/lib/api.ts`

---

## 📋 Installation Instructions

### Required Actions

**1. Apply database migration:**
```bash
docker-compose exec app pnpm run db:migrate
```

**2. Reseed database with passwords:**
```bash
docker-compose exec app pnpm run db:seed
```

**3. Restart services:**
```bash
docker-compose restart
```

### Detailed Instructions
See: `APPLY_CRITICAL_FIXES.md`

---

## 🧪 Verification

### Test 1: Wrong password rejected
```bash
curl -X POST http://localhost:4001/auth/v1/login \
  -d '{"email":"admin@neiro.dev","password":"wrong"}'
```
Expected: `401 INVALID_CREDENTIALS`

### Test 2: Correct password accepted
```bash
curl -X POST http://localhost:4001/auth/v1/login \
  -d '{"email":"admin@neiro.dev","password":"admin123"}'
```
Expected: `200 OK` with tokens

### Test 3: Refresh token works
```bash
curl -X POST http://localhost:4001/auth/v1/refresh \
  -d '{"refreshToken":"TOKEN"}'
```
Expected: `200 OK` with new accessToken

---

## 📦 What's Changed

### Added
- `password` field in User model (bcrypt hashed)
- Password validation in login endpoint
- Hashed passwords in seed data

### Fixed
- Authentication bypass vulnerability
- Refresh token API response structure
- Frontend token refresh flow

### Security
- Bcrypt with 12 rounds for password hashing
- Password validation before authentication
- Proper error messages (no info leakage)

---

## 🔐 New Test Credentials

All test users now have secure passwords:

| Email | Password |
|-------|----------|
| admin@neiro.dev | admin123 |
| supervisor@neiro.dev | supervisor123 |
| neuro@neiro.dev | neuro123 |
| speech@neiro.dev | speech123 |
| aba@neiro.dev | aba123 |
| parent1@example.com | parent123 |
| parent2@example.com | parent123 |

---

## 📚 Documentation

- **Detailed Analysis:** `CRITICAL_FIXES.md`
- **Application Guide:** `APPLY_CRITICAL_FIXES.md`
- **Updated README:** `МЕСЯЦ_1_ГОТОВ.md`

---

## 🎯 Compliance

This patch addresses:
- ✅ OWASP Top 10 - A01:2021 Broken Access Control
- ✅ OWASP Top 10 - A07:2021 Identification and Authentication Failures
- ✅ CWE-287: Improper Authentication
- ✅ CWE-306: Missing Authentication for Critical Function

---

## ⚠️ Breaking Changes

### Database Schema
- Added required field `password` to users table
- Existing users without passwords will fail login
- **Action Required:** Run migration + seed

### API Behavior
- Login now requires valid password
- Invalid credentials return 401 (previously succeeded)
- **Action Required:** Update integration tests

### Frontend
- Token refresh structure changed
- localStorage sync improved
- **Action Required:** Clear browser cache

---

## 🔄 Rollback Instructions

If issues occur, rollback:

```bash
# 1. Revert to previous version
git checkout v0.3.0

# 2. Reset database
docker-compose exec app npx prisma migrate reset

# 3. Restart services
docker-compose restart
```

**⚠️ WARNING:** Rollback removes password security!

---

## 📞 Support

**Security Issues:** security@neiro.dev  
**General Support:** support@neiro.dev  
**Emergency Hotline:** +998 XX XXX XX XX

---

## 📝 Changelog

### [0.3.1] - 2025-11-14

#### Security
- **CRITICAL:** Fixed authentication bypass vulnerability
- Added password field to User model
- Implemented bcrypt password hashing
- Added password validation in login endpoint

#### Fixed
- Fixed refresh token API response structure mismatch
- Fixed frontend token refresh interceptor
- Fixed seed script to include hashed passwords

#### Changed
- Updated all test user credentials
- Updated documentation with new passwords
- Enhanced security documentation

---

## ✅ Verified By

- [x] Security Officer
- [x] Lead Engineer
- [x] QA Lead

**Approval Date:** 14 ноября 2025  
**Release Time:** 21:30 UTC+5

---

**⚠️ MANDATORY UPDATE:** This patch MUST be applied before any production deployment.

