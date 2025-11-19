#!/bin/bash

# Get token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neiro.dev","password":"admin123"}' | jq -r '.data.accessToken')

CHILD_ID="d624f7f7-dd3a-4c15-864f-2357868bbf18"
PARENT_ID="339771a6-e017-4baf-872a-c19a97dcb9bc"

echo "Testing PATCH endpoint:"
echo "URL: http://localhost:8080/children/v1/$CHILD_ID/parents/$PARENT_ID"
echo ""

curl -v -X PATCH "http://localhost:8080/children/v1/$CHILD_ID/parents/$PARENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"relationship":"father","legalGuardian":true}' 2>&1 | grep -E "(< HTTP|success|error|title)"

echo ""
