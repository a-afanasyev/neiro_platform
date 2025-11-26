/**
 * Test script for Notifications Service API
 * Tests user notifications endpoints
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'neiro_jwt_secret_2024_development_only';

interface TestUser {
  userId: string;
  email: string;
  role: string;
}

const testUser: TestUser = {
  userId: '66666666-6666-6666-6666-666666666666',
  email: 'parent1@example.com',
  role: 'parent',
};

/**
 * Generate JWT token for test user
 */
function generateToken(user: TestUser): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Test API endpoint
 */
async function testEndpoint(
  method: string,
  path: string,
  token: string,
  body?: any
): Promise<any> {
  const url = `http://localhost:8080${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`\n${method} ${path}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('Notifications Service API Tests');
  console.log('='.repeat(60));

  const token = generateToken(testUser);
  console.log(`\nTest User: ${testUser.email} (${testUser.role})`);
  console.log(`Token: ${token.substring(0, 50)}...`);

  try {
    // Test 1: Get unread count
    console.log('\n' + '-'.repeat(60));
    console.log('Test 1: Get Unread Count');
    console.log('-'.repeat(60));
    await testEndpoint('GET', '/notifications/v1/user/unread-count', token);

    // Test 2: Get user notifications
    console.log('\n' + '-'.repeat(60));
    console.log('Test 2: Get User Notifications (with pagination)');
    console.log('-'.repeat(60));
    await testEndpoint('GET', '/notifications/v1/user?limit=5&offset=0', token);

    // Test 3: Get only unread notifications
    console.log('\n' + '-'.repeat(60));
    console.log('Test 3: Get Unread Notifications Only');
    console.log('-'.repeat(60));
    await testEndpoint('GET', '/notifications/v1/user?unreadOnly=true&limit=5', token);

    // Test 4: Create a new user notification
    console.log('\n' + '-'.repeat(60));
    console.log('Test 4: Create New User Notification');
    console.log('-'.repeat(60));
    const newNotification = {
      userId: testUser.userId,
      type: 'system_message',
      title: 'API Test Notification',
      body: 'This is a test notification created via API test script',
      actionUrl: '/dashboard/notifications',
    };
    const createResult = await testEndpoint('POST', '/notifications/v1/user/create', token, newNotification);

    // Test 5: Mark notification as read
    if (createResult.success && createResult.data?.id) {
      console.log('\n' + '-'.repeat(60));
      console.log('Test 5: Mark Notification as Read');
      console.log('-'.repeat(60));
      await testEndpoint('POST', `/notifications/v1/user/${createResult.data.id}/read`, token);
    }

    // Test 6: Get notifications after marking as read
    console.log('\n' + '-'.repeat(60));
    console.log('Test 6: Get Notifications After Read');
    console.log('-'.repeat(60));
    await testEndpoint('GET', '/notifications/v1/user?limit=5&offset=0', token);

    // Test 7: Mark all as read
    console.log('\n' + '-'.repeat(60));
    console.log('Test 7: Mark All Notifications as Read');
    console.log('-'.repeat(60));
    await testEndpoint('POST', '/notifications/v1/user/read-all', token);

    // Test 8: Delete notification
    if (createResult.success && createResult.data?.id) {
      console.log('\n' + '-'.repeat(60));
      console.log('Test 8: Delete Notification');
      console.log('-'.repeat(60));
      await testEndpoint('DELETE', `/notifications/v1/user/${createResult.data.id}`, token);
    }

    // Test 9: Final unread count
    console.log('\n' + '-'.repeat(60));
    console.log('Test 9: Final Unread Count');
    console.log('-'.repeat(60));
    await testEndpoint('GET', '/notifications/v1/user/unread-count', token);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60) + '\n');
  } catch (error: any) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
