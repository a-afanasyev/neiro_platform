#!/bin/sh
# Скрипт для запуска всех микросервисов напрямую (без Turbo)
# Используется в Docker контейнере для обхода проблем с file locking

echo "🚀 Запуск всех микросервисов..."

# Запуск backend сервисов
(cd /app/services/auth && pnpm dev) &
(cd /app/services/users && pnpm dev) &
(cd /app/services/children && pnpm dev) &
(cd /app/services/diagnostics && pnpm dev) &
(cd /app/services/routes && pnpm dev) &
(cd /app/services/assignments && pnpm dev) &
(cd /app/services/exercises && pnpm dev) &
(cd /app/services/templates && pnpm dev) &

# Запуск фронтенда
(cd /app/apps/web && pnpm dev) &

echo "✅ Все сервисы запущены в фоновом режиме"
echo "Ожидайте 30 секунд для полной инициализации..."

# Ждем завершения всех процессов
wait
