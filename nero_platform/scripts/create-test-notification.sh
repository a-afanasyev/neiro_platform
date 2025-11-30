#!/bin/bash

# Получаем токен администратора
echo "Получение токена администратора..."
TOKEN=$(curl -s -X POST http://localhost:8080/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neiro.dev","password":"admin123"}' \
  | jq -r '.data.accessToken' 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "Ошибка: не удалось получить токен"
  exit 1
fi

echo "Токен получен, создаем уведомление..."

# Получаем ID пользователя parent1
USER_ID=$(curl -s -X GET http://localhost:8080/users/v1?email=parent1@example.com \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id' 2>/dev/null)

if [ -z "$USER_ID" ]; then
  echo "Ошибка: не удалось получить ID пользователя"
  exit 1
fi

echo "ID пользователя: $USER_ID"

# Создаем тестовое уведомление
RESPONSE=$(curl -s -X POST http://localhost:8080/notifications/v1/user/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"type\": \"assignment_reminder\",
    \"title\": \"Напоминание о задании\",
    \"body\": \"У вашего ребенка есть невыполненные задания на сегодня.\",
    \"link\": \"/dashboard/assignments\"
  }")

# Проверяем результат
SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Тестовое уведомление успешно создано"
else
  echo "❌ Ошибка создания уведомления"
  echo "$RESPONSE"
fi
