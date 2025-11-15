#!/bin/bash

echo "=== Тестирование логина всех ролей ==="
echo ""

# Admin
echo "1. ADMIN (admin@neiro.dev / admin123)"
ADMIN_RESULT=$(curl -s -X POST http://localhost:4001/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neiro.dev","password":"admin123"}')
ADMIN_SUCCESS=$(echo $ADMIN_RESULT | jq -r '.success')
ADMIN_ROLE=$(echo $ADMIN_RESULT | jq -r '.data.user.role')
echo "   Успех: $ADMIN_SUCCESS, Роль: $ADMIN_ROLE"

# Supervisor
echo "2. SUPERVISOR (supervisor@neiro.dev / supervisor123)"
SUPER_RESULT=$(curl -s -X POST http://localhost:4001/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"supervisor@neiro.dev","password":"supervisor123"}')
SUPER_SUCCESS=$(echo $SUPER_RESULT | jq -r '.success')
SUPER_ROLE=$(echo $SUPER_RESULT | jq -r '.data.user.role')
echo "   Успех: $SUPER_SUCCESS, Роль: $SUPER_ROLE"

# Specialist (Нейропсихолог)
echo "3. SPECIALIST (neuro@neiro.dev / neuro123)"
SPEC_RESULT=$(curl -s -X POST http://localhost:4001/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"neuro@neiro.dev","password":"neuro123"}')
SPEC_SUCCESS=$(echo $SPEC_RESULT | jq -r '.success')
SPEC_ROLE=$(echo $SPEC_RESULT | jq -r '.data.user.role')
echo "   Успех: $SPEC_SUCCESS, Роль: $SPEC_ROLE"

# Parent 1
echo "4. PARENT 1 (parent1@neiro.dev / parent123)"
PAR1_RESULT=$(curl -s -X POST http://localhost:4001/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent1@neiro.dev","password":"parent123"}')
PAR1_SUCCESS=$(echo $PAR1_RESULT | jq -r '.success')
PAR1_ROLE=$(echo $PAR1_RESULT | jq -r '.data.user.role')
echo "   Успех: $PAR1_SUCCESS, Роль: $PAR1_ROLE"

echo ""
echo "=== Итого ==="
if [ "$ADMIN_SUCCESS" = "true" ] && [ "$SUPER_SUCCESS" = "true" ] && [ "$SPEC_SUCCESS" = "true" ] && [ "$PAR1_SUCCESS" = "true" ]; then
    echo "✅ Все 4 роли успешно входят"
else
    echo "❌ Есть проблемы с логином"
fi
