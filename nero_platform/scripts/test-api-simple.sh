#!/bin/bash

# Упрощенный скрипт для тестирования API
# Использует существующих пользователей из seed данных

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TOTAL=0
PASSED=0
FAILED=0

test_api() {
  local method=$1
  local url=$2
  local data=$3
  local expected=$4
  local desc=$5
  local token=$6
  
  TOTAL=$((TOTAL + 1))
  
  local cmd="curl -s -w '\n%{http_code}' -X $method"
  [ -n "$token" ] && cmd="$cmd -H 'Authorization: Bearer $token'"
  [ -n "$data" ] && cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
  cmd="$cmd '$url'"
  
  response=$(eval $cmd 2>&1)
  code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$code" = "$expected" ]; then
    echo -e "${GREEN}✓${NC} $desc"
    PASSED=$((PASSED + 1))
    echo "$body" | head -3
    return 0
  else
    echo -e "${RED}✗${NC} $desc (ожидался $expected, получен $code)"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

echo -e "${YELLOW}=== Тестирование API ===${NC}\n"

# Логин admin
echo "Auth API:"
LOGIN_RESPONSE=$(test_api "POST" "http://localhost:4001/auth/v1/login" '{"email":"admin@neiro.dev","password":"admin123"}' "200" "POST /auth/v1/login")
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4 || echo "")

test_api "GET" "http://localhost:4001/health" "" "200" "GET /health (auth)"

# Users API
echo -e "\nUsers API:"
test_api "GET" "http://localhost:4002/users/v1" "" "200" "GET /users/v1" "$TOKEN"
test_api "GET" "http://localhost:4002/health" "" "200" "GET /health (users)"

# Children API  
echo -e "\nChildren API:"
test_api "GET" "http://localhost:4003/children/v1" "" "200" "GET /children/v1" "$TOKEN"
test_api "GET" "http://localhost:4003/health" "" "200" "GET /health (children)"

# Diagnostics API
echo -e "\nDiagnostics API:"
test_api "GET" "http://localhost:4004/diagnostics/v1" "" "200" "GET /diagnostics/v1" "$TOKEN"
test_api "GET" "http://localhost:4004/health" "" "200" "GET /health (diagnostics)"

# Routes API
echo -e "\nRoutes API:"
test_api "GET" "http://localhost:4005/routes/v1" "" "200" "GET /routes/v1" "$TOKEN"
test_api "GET" "http://localhost:4005/health" "" "200" "GET /health (routes)"

# Assignments API
echo -e "\nAssignments API:"
test_api "GET" "http://localhost:4006/assignments/v1" "" "200" "GET /assignments/v1" "$TOKEN"
test_api "GET" "http://localhost:4006/health" "" "200" "GET /health (assignments)"

# Exercises API
echo -e "\nExercises API:"
test_api "GET" "http://localhost:4007/exercises/v1" "" "200" "GET /exercises/v1" "$TOKEN"
test_api "GET" "http://localhost:4007/exercises/v1/categories" "" "200" "GET /exercises/v1/categories" "$TOKEN"
test_api "GET" "http://localhost:4007/health" "" "200" "GET /health (exercises)"

# Templates API
echo -e "\nTemplates API:"
test_api "GET" "http://localhost:4008/templates/v1" "" "200" "GET /templates/v1" "$TOKEN"
test_api "GET" "http://localhost:4008/health" "" "200" "GET /health (templates)"

echo -e "\n${YELLOW}=== Результаты ===${NC}"
echo "Всего: $TOTAL | ${GREEN}Успешно: $PASSED${NC} | ${RED}Провалено: $FAILED${NC}"

[ $FAILED -eq 0 ] && exit 0 || exit 1


