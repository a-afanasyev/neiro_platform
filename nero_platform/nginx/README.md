# API Gateway (nginx)

## Описание

API Gateway для маршрутизации запросов от фронтенда на микросервисы Neiro Platform.

## Конфигурация

Gateway слушает на порту **8080** и маршрутизирует запросы на следующие микросервисы:

| Путь | Сервис | Порт |
|------|--------|------|
| `/auth/*` | Auth Service | 4001 |
| `/users/*` | Users Service | 4002 |
| `/children/*` | Children Service | 4003 |
| `/diagnostics/*` | Diagnostics Service | 4004 |
| `/routes/*` | Routes Service | 4005 |
| `/assignments/*` | Assignments Service | 4006 |
| `/exercises/*` | Exercises Service | 4007 |
| `/templates/*` | Templates Service | 4008 |

## Использование

### Запуск

```bash
# Запустить все сервисы включая Gateway
docker compose up -d

# Проверить статус Gateway
curl http://localhost:8080/health
```

### Проверка маршрутизации

```bash
# Получить токен авторизации
TOKEN=$(curl -s -X POST http://localhost:8080/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neiro.dev","password":"admin123"}' \
  | jq -r '.data.accessToken')

# Проверить доступ к Users Service через Gateway
curl -s http://localhost:8080/users/v1 \
  -H "Authorization: Bearer $TOKEN" | jq

# Проверить доступ к Children Service через Gateway
curl -s http://localhost:8080/children/v1 \
  -H "Authorization: Bearer $TOKEN" | jq

# Проверить доступ к Diagnostics Service через Gateway
curl -s http://localhost:8080/diagnostics/v1/questionnaires \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Конфигурация фронтенда

Фронтенд настроен на использование Gateway через переменную окружения:

```javascript
// apps/web/next.config.js
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
}
```

## Логи

Логи nginx доступны в контейнере:

```bash
# Просмотр логов Gateway
docker logs neiro_gateway

# Просмотр access log
docker exec neiro_gateway tail -f /var/log/nginx/access.log

# Просмотр error log
docker exec neiro_gateway tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Gateway не запускается

Проверьте, что все микросервисы запущены:

```bash
docker compose ps
```

### 502 Bad Gateway

Убедитесь, что целевой микросервис здоров:

```bash
curl http://localhost:4001/health  # Auth
curl http://localhost:4002/health  # Users
curl http://localhost:4003/health  # Children
# и т.д.
```

### Фронтенд не может подключиться

Проверьте, что фронтенд использует правильный API URL:

```bash
# В браузере откройте консоль и проверьте
console.log(process.env.NEXT_PUBLIC_API_URL)
# Должно быть: http://localhost:8080
```

