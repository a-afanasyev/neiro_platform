import jwt from 'jsonwebtoken';

const JWT_SECRET = 'dev_access_secret_change_in_production_2024';

// Create token for parent user
const parentToken = jwt.sign(
  {
    userId: '66666666-6666-6666-6666-666666666666',
    email: 'parent1@example.com',
    role: 'parent'
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// Create token for specialist user
const specialistToken = jwt.sign(
  {
    userId: '33333333-3333-3333-3333-333333333333',
    email: 'specialist1@example.com',
    role: 'specialist'
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('Parent Token:', parentToken);
console.log('\nSpecialist Token:', specialistToken);

// Test GET /reports endpoint
async function testGetReports() {
  console.log('\n\n=== Testing GET /reports/v1 ===');

  const response = await fetch('http://localhost:4009/reports/v1', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${parentToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

// Test POST /reports endpoint
async function testCreateReport() {
  console.log('\n\n=== Testing POST /reports/v1 ===');

  const reportData = {
    assignmentId: '847eea87-7665-485a-8dc2-ccd2ee9d1107',
    status: 'completed',
    childMood: 'good',
    feedbackText: 'Ребенок отлично справился с заданием! Проявил большой интерес и усердие.'
  };

  const response = await fetch('http://localhost:4009/reports/v1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${parentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reportData)
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));

  return data;
}

// Run tests
(async () => {
  try {
    await testGetReports();
    const report = await testCreateReport();

    if (report && report.id) {
      console.log('\n\n=== Testing GET /reports/v1/:id ===');
      const getResponse = await fetch(`http://localhost:4009/reports/v1/${report.id}`, {
        headers: {
          'Authorization': `Bearer ${parentToken}`,
          'Content-Type': 'application/json'
        }
      });
      const getData = await getResponse.json();
      console.log('Status:', getResponse.status);
      console.log('Response:', JSON.stringify(getData, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
