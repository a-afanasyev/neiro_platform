#!/bin/bash

# Скрипт для функционального тестирования всех API endpoints
# Тестирует Month 1 и Month 2 API сервисы

set -e

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переменные для хранения результатов
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_ENDPOINTS=()

# Функция для выполнения HTTP запроса и проверки результата
test_endpoint() {
  local method=$1
  local url=$2
  local data=$3
  local expected_status=$4
  local description=$5
  local auth_token=$6
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  # Формируем curl команду
  local curl_cmd="curl -s -w '\n%{http_code}' -X $method"
  
  if [ -n "$auth_token" ]; then
    curl_cmd="$curl_cmd -H 'Authorization: Bearer $auth_token'"
  fi
  
  if [ -n "$data" ]; then
    curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
  fi
  
  curl_cmd="$curl_cmd '$url'"
  
  # Выполняем запрос
  response=$(eval $curl_cmd 2>&1)
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  # Проверяем статус код
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} $description (HTTP $http_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "$body"
    return 0
  else
    echo -e "${RED}✗${NC} $description (ожидался HTTP $expected_status, получен HTTP $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    FAILED_ENDPOINTS+=("$description")
    echo "$body"
    return 1
  fi
}

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Функциональное тестирование API${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# ============================================
# 4.1. Auth API (порт 4001)
# ============================================
echo -e "${YELLOW}--- Auth API ---${NC}"

# Регистрация нового пользователя
REGISTER_DATA='{"email":"test@example.com","password":"Test123!@#","firstName":"Test","lastName":"User","role":"parent"}'
REGISTER_RESPONSE=$(test_endpoint "POST" "http://localhost:4001/auth/v1/register" "$REGISTER_DATA" "201" "POST /auth/v1/register - регистрация")
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4 || echo "")
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4 || echo "")

# Логин
LOGIN_DATA='{"email":"test@example.com","password":"Test123!@#"}'
LOGIN_RESPONSE=$(test_endpoint "POST" "http://localhost:4001/auth/v1/login" "$LOGIN_DATA" "200" "POST /auth/v1/login - логин")
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4 || echo "$ACCESS_TOKEN")
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4 || echo "$REFRESH_TOKEN")

# Refresh token
if [ -n "$REFRESH_TOKEN" ]; then
  REFRESH_DATA="{\"refreshToken\":\"$REFRESH_TOKEN\"}"
  test_endpoint "POST" "http://localhost:4001/auth/v1/refresh" "$REFRESH_DATA" "200" "POST /auth/v1/refresh - обновление токена"
fi

# Logout
if [ -n "$ACCESS_TOKEN" ]; then
  test_endpoint "POST" "http://localhost:4001/auth/v1/logout" "" "200" "POST /auth/v1/logout - выход" "$ACCESS_TOKEN"
fi

# Health check
test_endpoint "GET" "http://localhost:4001/health" "" "200" "GET /health - проверка работоспособности"

echo ""

# ============================================
# 4.2. Users API (порт 4002)
# ============================================
echo -e "${YELLOW}--- Users API ---${NC}"

# Получение списка пользователей (требует auth)
if [ -n "$ACCESS_TOKEN" ]; then
  USERS_RESPONSE=$(test_endpoint "GET" "http://localhost:4002/users/v1" "" "200" "GET /users/v1 - список пользователей" "$ACCESS_TOKEN")
  USER_ID=$(echo "$USERS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
  
  # Получение пользователя по ID
  if [ -n "$USER_ID" ]; then
    test_endpoint "GET" "http://localhost:4002/users/v1/$USER_ID" "" "200" "GET /users/v1/:id - получение пользователя" "$ACCESS_TOKEN"
  fi
fi

# Health check
test_endpoint "GET" "http://localhost:4002/health" "" "200" "GET /health - проверка работоспособности"

echo ""

# ============================================
# 4.3. Children API (порт 4003)
# ============================================
echo -e "${YELLOW}--- Children API ---${NC}"

# Создание ребенка
if [ -n "$ACCESS_TOKEN" ]; then
  CHILD_DATA='{"firstName":"Test","lastName":"Child","dateOfBirth":"2020-01-01","gender":"male"}'
  CHILD_RESPONSE=$(test_endpoint "POST" "http://localhost:4003/children/v1" "$CHILD_DATA" "201" "POST /children/v1 - создание ребенка" "$ACCESS_TOKEN")
  CHILD_ID=$(echo "$CHILD_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "")
  
  # Получение списка детей
  test_endpoint "GET" "http://localhost:4003/children/v1" "" "200" "GET /children/v1 - список детей" "$ACCESS_TOKEN")
  
  # Получение ребенка по ID
  if [ -n "$CHILD_ID" ]; then
    test_endpoint "GET" "http://localhost:4003/children/v1/$CHILD_ID" "" "200" "GET /children/v1/:id - получение ребенка" "$ACCESS_TOKEN")
  fi
fi

# Health check
test_endpoint "GET" "http://localhost:4003/health" "" "200" "GET /health - проверка работоспособности"

echo ""

# ============================================
# 4.4. Diagnostics API (порт 4004)
# ============================================
echo -e "${YELLOW}--- Diagnostics API ---${NC}"

# Создание диагностики
if [ -n "$ACCESS_TOKEN" ] && [ -n "$CHILD_ID" ]; then
  DIAG_DATA="{\"childId\":\"$CHILD_ID\",\"type\":\"initial\",\"notes\":\"Test diagnostic\"}"
  DIAG_RESPONSE=$(test_endpoint "POST" "http://localhost:4004/diagnostics/v1" "$DIAG_DATA" "201" "POST /diagnostics/v1 - создание диагностики" "$ACCESS_TOKEN")
  
  # Получение списка диагностик
  test_endpoint "GET" "http://localhost:4004/diagnostics/v1" "" "200" "GET /diagnostics/v1 - список диагностик" "$ACCESS_TOKEN")
fi

# Health check
test_endpoint "GET" "http://localhost:4004/health" "" "200" "GET /health - проверка работоспособности"

echo ""

# ============================================
# 4.5. Routes API (порт 4005)
# ============================================
echo -e "${YELLOW}--- Routes API ---${NC}"

# Создание маршрута
if [ -n "$ACCESS_TOKEN" ] && [ -n "$CHILD_ID" ]; then
  ROUTE_DATA="{\"childId\":\"$CHILD_ID\",\"name\":\"Test Route\",\"description\":\"Test route description\"}"
  ROUTE_RESPONSE=$(test_endpoint "POST" "http://localhost:4005/routes/v1" "$ROUTE_DATA" "201" "POST /routes/v1 - создание маршрута" "$ACCESS_TOKEN")
  ROUTE_ID=$(echo "$ROUTE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "")
  
  # Получение списка маршрутов
  test_endpoint "GET" "http://localhost:4005/routes/v1" "" "200" "GET /routes/v1 - список маршрутов" "$ACCESS_TOKEN")
  
  # Получение маршрута по ID
  if [ -n "$ROUTE_ID" ]; then
    test_endpoint "GET" "http://localhost:4005/routes/v1/$ROUTE_ID" "" "200" "GET /routes/v1/:id - получение маршрута" "$ACCESS_TOKEN")
    
    # Активация маршрута
    test_endpoint "POST" "http://localhost:4005/routes/v1/$ROUTE_ID/activate" "" "200" "POST /routes/v1/:id/activate - активация маршрута" "$ACCESS_TOKEN")
  fi
fi

# Health check
test_endpoint "GET" "http://localhost:4005/health" "" "200" "GET /health - проверка работоспособности"

echo ""

# ============================================
# 4.6. Assignments API (порт 4006)
# ============================================
echo -e "${YELLOW}--- Assignments API ---${NC}"

# Создание назначения
if [ -n "$ACCESS_TOKEN" ] && [ -n "$ROUTE_ID" ]; then
  ASSIGNMENT_DATA="{\"routeId\":\"$ROUTE_ID\",\"scheduledDate\":\"2025-12-01T10:00:00Z\"}"
  ASSIGNMENT_RESPONSE=$(test_endpoint "POST" "http://localhost:4006/assignments/v1" "$ASSIGNMENT_DATA" "201" "POST /assignments/v1 - создание назначения" "$ACCESS_TOKEN")
  ASSIGNMENT_ID=$(echo "$ASSIGNMENT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "")
  
  # Получение списка назначений
  test_endpoint "GET" "http://localhost:4006/assignments/v1" "" "200" "GET /assignments/v1 - список назначений" "$ACCESS_TOKEN")
  
  # Получение назначения по ID
  if [ -n "$ASSIGNMENT_ID" ]; then
    test_endpoint "GET" "http://localhost:4006/assignments/v1/$ASSIGNMENT_ID" "" "200" "GET /assignments/v1/:id - получение назначения" "$ACCESS_TOKEN")
    
    # Изменение статуса
    STATUS_DATA='{"status":"completed"}'
    test_endpoint "PATCH" "http://localhost:4006/assignments/v1/$ASSIGNMENT_ID/status" "$STATUS_DATA" "200" "PATCH /assignments/v1/:id/status - изменение статуса" "$ACCESS_TOKEN")
  fi
  
  # Календарь назначений
  test_endpoint "GET" "http://localhost:4006/assignments/v1/calendar" "" "200" "GET /assignments/v1/calendar - календарь назначений" "$ACCESS_TOKEN")
fi

# Health check
test_endpoint "GET" "http://localhost:4006/health" "" "200" "GET /health - проверка работоспособности"

echo ""

# ============================================
# 4.7. Exercises API (порт 4007)
# ============================================
echo -e "${YELLOW}--- Exercises API ---${NC}"

# Получение списка упражнений
test_endpoint "GET" "http://localhost:4007/exercises/v1" "" "200" "GET /exercises/v1 - список упражнений" "$ACCESS_TOKEN")

# Получение категорий
test_endpoint "GET" "http://localhost:4007/exercises/v1/categories" "" "200" "GET /exercises/v1/categories - получение категорий" "$ACCESS_TOKEN")

# Health check
test_endpoint "GET" "http://localhost:4007/health" "" "200" "GET /health - проверка работоспособности"

echo ""

# ============================================
# 4.8. Templates API (порт 4008)
# ============================================
echo -e "${YELLOW}--- Templates API ---${NC}"

# Получение списка шаблонов
test_endpoint "GET" "http://localhost:4008/templates/v1" "" "200" "GET /templates/v1 - список шаблонов" "$ACCESS_TOKEN")

# Health check
test_endpoint "GET" "http://localhost:4008/health" "" "200" "GET /health - проверка работоспособности"

echo ""

# ============================================
# Итоговая статистика
# ============================================
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Результаты тестирования${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "Всего тестов: $TOTAL_TESTS"
echo -e "${GREEN}Успешно: $PASSED_TESTS${NC}"
echo -e "${RED}Провалено: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -gt 0 ]; then
  echo ""
  echo -e "${RED}Проваленные тесты:${NC}"
  for endpoint in "${FAILED_ENDPOINTS[@]}"; do
    echo "  - $endpoint"
  done
  exit 1
else
  echo ""
  echo -e "${GREEN}Все тесты пройдены успешно!${NC}"
  exit 0
fi

