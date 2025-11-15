#!/bin/bash
# Скрипт для проверки rate limiting
# Проверяет, что rate limiting установлен на 100 попыток в минуту

echo "🔍 Проверка rate limiting (100 попыток в минуту)"
echo "================================================"

# Функция для выполнения одного запроса
make_request() {
  local response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:4001/auth/v1/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@neiro.dev","password":"admin123"}')
  
  local status_code=$(echo "$response" | tail -1)
  local body=$(echo "$response" | sed '$d')
  
  echo "$status_code|$body"
}

# Счетчики
success_count=0
rate_limit_count=0
total_requests=0

echo ""
echo "📊 Отправка 110 запросов для проверки лимита..."
echo ""

# Отправляем 110 запросов (больше лимита в 100)
for i in {1..110}; do
  result=$(make_request)
  status_code=$(echo "$result" | cut -d'|' -f1)
  body=$(echo "$result" | cut -d'|' -f2-)
  
  total_requests=$((total_requests + 1))
  
  if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
    success_count=$((success_count + 1))
    if [ $i -le 10 ] || [ $i -eq 50 ] || [ $i -eq 100 ]; then
      echo "✅ Запрос $i: Успех (HTTP $status_code)"
    fi
  elif [ "$status_code" = "429" ]; then
    rate_limit_count=$((rate_limit_count + 1))
    if [ $rate_limit_count -eq 1 ]; then
      echo ""
      echo "⚠️  Запрос $i: Rate Limit достигнут! (HTTP 429)"
      echo "   Первый rate limit на запросе: $i"
      echo ""
    fi
  else
    echo "❌ Запрос $i: Неожиданный статус (HTTP $status_code)"
  fi
  
  # Небольшая задержка между запросами
  sleep 0.1
done

echo ""
echo "================================================"
echo "📈 Результаты проверки:"
echo "   Всего запросов: $total_requests"
echo "   Успешных: $success_count"
echo "   Rate Limit (429): $rate_limit_count"
echo ""

if [ $success_count -le 100 ] && [ $rate_limit_count -gt 0 ]; then
  echo "✅ Rate limiting работает правильно!"
  echo "   Лимит установлен на ~$success_count запросов в минуту"
else
  echo "⚠️  Ожидалось ~100 успешных запросов и rate limit после этого"
  echo "   Фактически: $success_count успешных, $rate_limit_count rate limit ошибок"
fi

echo ""

