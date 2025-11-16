#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "===> Reset database (drop, migrate, seed) for Neiro Platform"

cd "$ROOT_DIR/packages/database"

echo " - Resetting database and applying all migrations..."
# Используем migrate reset, чтобы в одном шаге:
# 1) дропнуть БД,
# 2) применить все миграции,
# 3) (опционально) запустить seed.
# Флаг --skip-generate пропускает генерацию клиента (уже сгенерирован в репозитории).
npx prisma migrate reset --force --skip-generate --skip-seed

echo " - Seeding database..."
npx prisma db seed

echo "===> Database reset completed successfully."


