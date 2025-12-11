#!/bin/bash

# Скрипт для запуска E2E тестов
echo "🧪 Запуск E2E тестов для Neiro Platform"
echo ""

# Проверяем, что Playwright установлен
if [ ! -d "node_modules/.pnpm/@playwright+test@1.56.1" ]; then
    echo "❌ Playwright не установлен"
    exit 1
fi

echo "✅ Playwright установлен"

# Запускаем тесты
echo "📋 Список доступных тестов:"
node node_modules/.pnpm/@playwright+test@1.56.1/node_modules/playwright test --list

echo ""
echo "🚀 Запуск теста авторизации:"
node node_modules/.pnpm/@playwright+test@1.56.1/node_modules/playwright test auth.spec.ts --reporter=list

echo ""
echo "✅ E2E тесты запущены"






