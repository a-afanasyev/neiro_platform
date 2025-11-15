#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ МЕСЯЦ 1 - NEIRO PLATFORM     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Проверка API здоровья
echo "1️⃣  Проверка API сервисов..."
AUTH_HEALTH=$(curl -s http://localhost:4001/health | jq -r '.status')
if [ "$AUTH_HEALTH" = "healthy" ]; then
    echo "   ✅ Auth Service: $AUTH_HEALTH"
else
    echo "   ❌ Auth Service: недоступен"
    exit 1
fi

# 2. Проверка фронтенда
echo ""
echo "2️⃣  Проверка Frontend..."
FRONTEND=$(curl -s http://localhost:3001 | grep -o "Neiro Platform" | head -1)
if [ "$FRONTEND" = "Neiro Platform" ]; then
    echo "   ✅ Frontend: работает"
else
    echo "   ❌ Frontend: недоступен"
    exit 1
fi

# 3. Тестирование логина всех ролей
echo ""
echo "3️⃣  Тестирование логина всех ролей..."

test_login() {
    local email=$1
    local password=$2
    local role_name=$3
    
    result=$(curl -s -X POST http://localhost:4001/auth/v1/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    success=$(echo $result | jq -r '.success')
    role=$(echo $result | jq -r '.data.user.role')
    
    if [ "$success" = "true" ]; then
        echo "   ✅ $role_name ($email): SUCCESS - role: $role"
        return 0
    else
        error=$(echo $result | jq -r '.detail // .title // "Unknown"')
        echo "   ❌ $role_name ($email): FAILED - $error"
        return 1
    fi
}

test_login "admin@neiro.dev" "admin123" "Admin"
test_login "supervisor@neiro.dev" "supervisor123" "Supervisor"
test_login "neuro@neiro.dev" "neuro123" "Specialist"
test_login "parent1@neiro.dev" "parent123" "Parent"

# 4. Проверка данных в базе
echo ""
echo "4️⃣  Проверка данных в базе..."
docker-compose exec -T postgres psql -U neiro_user -d neiro_platform << 'EOSQL' 2>&1 | grep -v "^time=" | grep -v "obsolete"
\t
\pset footer off
SELECT 
    'Users' as entity,
    COUNT(*)::text as count,
    string_agg(DISTINCT role, ', ') as roles
FROM users
UNION ALL
SELECT 
    'Specialists',
    COUNT(*)::text,
    '-'
FROM specialist
UNION ALL
SELECT 
    'Children',
    COUNT(*)::text,
    '-'
FROM child;
EOSQL

echo ""
echo "5️⃣  Проверка учетных записей по ролям..."
docker-compose exec -T postgres psql -U neiro_user -d neiro_platform << 'EOSQL' 2>&1 | grep -v "^time=" | grep -v "obsolete"
\t
\pset footer off
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;
EOSQL

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ТЕСТИРОВАНИЕ ЗАВЕРШЕНО                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
