#!/bin/bash

# Test Parent Management API

echo "=== Testing Parent Management API ==="
echo ""

# Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neiro.dev","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE" | jq .
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:30}..."
echo ""

# Get list of children
echo "2. Getting list of children..."
CHILDREN=$(curl -s -X GET http://localhost:8080/children/v1 \
  -H "Authorization: Bearer $TOKEN")

CHILD_ID=$(echo $CHILDREN | jq -r '.data[0].id')

if [ "$CHILD_ID" == "null" ] || [ -z "$CHILD_ID" ]; then
  echo "❌ No children found"
  exit 1
fi

echo "✅ Found child: $CHILD_ID"
echo ""

# Get child details
echo "3. Getting child details..."
CHILD_DETAILS=$(curl -s -X GET "http://localhost:8080/children/v1/$CHILD_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$CHILD_DETAILS" | jq '.data.parents'
echo ""

# Get list of parents
echo "4. Getting list of users with role=parent..."
PARENTS=$(curl -s -X GET "http://localhost:8080/users/v1?role=parent" \
  -H "Authorization: Bearer $TOKEN")

PARENT_ID=$(echo $PARENTS | jq -r '.data[0].id')

if [ "$PARENT_ID" == "null" ] || [ -z "$PARENT_ID" ]; then
  echo "❌ No parents found"
  exit 1
fi

echo "✅ Found parent: $PARENT_ID"
echo ""

# Check if PATCH endpoint exists
echo "5. Testing PATCH /children/v1/:id/parents/:parentId endpoint..."
echo "Checking if parent is already linked..."

EXISTING_PARENT=$(echo $CHILD_DETAILS | jq -r ".data.parents[0].id")

if [ "$EXISTING_PARENT" == "null" ] || [ -z "$EXISTING_PARENT" ]; then
  echo "⚠️  No parents linked to this child. Need to add one first."

  echo "Adding parent to child..."
  ADD_RESPONSE=$(curl -s -X POST "http://localhost:8080/children/v1/$CHILD_ID/parents" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"parentUserId\":\"$PARENT_ID\",\"relationship\":\"guardian\",\"legalGuardian\":true}")

  echo "$ADD_RESPONSE" | jq .

  EXISTING_PARENT=$PARENT_ID
fi

echo "Updating parent relationship..."
UPDATE_RESPONSE=$(curl -s -X PATCH "http://localhost:8080/children/v1/$CHILD_ID/parents/$EXISTING_PARENT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"relationship":"mother","legalGuardian":true}')

echo "$UPDATE_RESPONSE" | jq .

if echo "$UPDATE_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo "✅ PATCH endpoint works!"
else
  echo "❌ PATCH endpoint failed"
fi

echo ""
echo "=== Test Complete ==="
