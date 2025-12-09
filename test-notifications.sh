#!/bin/bash

# Get token
echo "=== Getting JWT token ==="
LOGIN_RESPONSE=$(docker exec -i neiro_gateway sh -c 'curl -s -X POST "http://auth:4000/auth/v1/login" -H "Content-Type: application/json" -d "{\"email\": \"parent1@example.com\", \"password\": \"parent123\"}"')
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
echo "Token: ${TOKEN:0:50}..."

# Test 1: Get unread count
echo ""
echo "=== Test 1: Get Unread Count ==="
docker exec -i neiro_gateway sh -c "curl -s -X GET 'http://notifications:4011/notifications/v1/user/unread-count' -H 'Authorization: Bearer $TOKEN'"

# Test 2: Get notifications
echo ""
echo ""
echo "=== Test 2: Get Notifications (limit 5) ==="
docker exec -i neiro_gateway sh -c "curl -s -X GET 'http://notifications:4011/notifications/v1/user?limit=5' -H 'Authorization: Bearer $TOKEN'" | python3 -m json.tool

# Test 3: Create notification
echo ""
echo "=== Test 3: Create New Notification ==="
docker exec -i neiro_gateway sh -c "curl -s -X POST 'http://notifications:4011/notifications/v1/user/create' -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"userId\": \"66666666-6666-6666-6666-666666666666\", \"type\": \"system_message\", \"title\": \"API Test Success\", \"body\": \"Notification created successfully\", \"link\": \"/dashboard\"}'" | python3 -m json.tool

# Test 4: Get unread count again
echo ""
echo "=== Test 4: Get Unread Count After Creation ==="
docker exec -i neiro_gateway sh -c "curl -s -X GET 'http://notifications:4011/notifications/v1/user/unread-count' -H 'Authorization: Bearer $TOKEN'"

echo ""
echo "=== Tests completed ==="
