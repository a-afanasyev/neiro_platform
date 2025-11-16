#!/bin/bash

# Скрипт для ожидания готовности всех сервисов
# Проверяет health endpoints всех микросервисов

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Список сервисов и их портов
declare -A SERVICES=(
  ["auth"]="http://localhost:4001/health"
  ["users"]="http://localhost:4002/health"
  ["children"]="http://localhost:4003/health"
  ["diagnostics"]="http://localhost:4004/health"
  ["routes"]="http://localhost:4005/health"
  ["assignments"]="http://localhost:4006/health"
  ["exercises"]="http://localhost:4007/health"
  ["templates"]="http://localhost:4008/health"
)

# Максимальное время ожидания (в секундах)
MAX_WAIT=300
# Интервал проверки (в секундах)
CHECK_INTERVAL=5

echo -e "${YELLOW}Ожидание готовности сервисов...${NC}"

# Функция для проверки health endpoint
check_service() {
  local service_name=$1
  local health_url=$2
  
  if curl -f -s "$health_url" > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Функция для ожидания готовности сервиса
wait_for_service() {
  local service_name=$1
  local health_url=$2
  local elapsed=0
  
  while [ $elapsed -lt $MAX_WAIT ]; do
    if check_service "$service_name" "$health_url"; then
      echo -e "${GREEN}✓${NC} $service_name готов"
      return 0
    fi
    
    echo -e "${YELLOW}Ожидание $service_name... (${elapsed}s)${NC}"
    sleep $CHECK_INTERVAL
    elapsed=$((elapsed + CHECK_INTERVAL))
  done
  
  echo -e "${RED}✗${NC} $service_name не готов за $MAX_WAIT секунд"
  return 1
}

# Проверка всех сервисов
all_ready=true
for service in "${!SERVICES[@]}"; do
  if ! wait_for_service "$service" "${SERVICES[$service]}"; then
    all_ready=false
  fi
done

if [ "$all_ready" = true ]; then
  echo -e "\n${GREEN}Все сервисы готовы!${NC}"
  exit 0
else
  echo -e "\n${RED}Некоторые сервисы не готовы${NC}"
  exit 1
fi
