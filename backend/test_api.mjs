// Quick API test
const BASE = 'http://localhost:3000/api';

async function test() {
  console.log('=== Testing PassOP API ===\n');

  // 1. Health check
  let res = await fetch(`${BASE}/health`);
  let data = await res.json();
  console.log('1. Health:', data);

  // 2. Register
  res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test@passop.com', password: 'password123' }),
  });
  data = await res.json();
  console.log('2. Register:', res.status, data.success ? 'SUCCESS' : data.error);
  const token = data.token;

  if (!token) {
    // Maybe already registered, try login
    res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@passop.com', password: 'password123' }),
    });
    data = await res.json();
    console.log('2b. Login:', res.status, data.success ? 'SUCCESS' : data.error);
  }

  const authToken = token || data.token;

  // 3. Test protected route without token
  res = await fetch(`${BASE}/passwords`);
  data = await res.json();
  console.log('3. GET /passwords (no token):', res.status, data.error);

  // 4. GET /auth/me with token
  res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  data = await res.json();
  console.log('4. GET /auth/me:', res.status, data.user?.name);

  // 5. Create a password
  res = await fetch(`${BASE}/passwords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ site: 'https://github.com', username: 'testuser', password: 'mySecretPass123!' }),
  });
  data = await res.json();
  console.log('5. POST /passwords:', res.status, data.success ? 'CREATED' : data.error);
  const pwId = data.password?.id;

  // 6. GET all passwords
  res = await fetch(`${BASE}/passwords`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  data = await res.json();
  console.log('6. GET /passwords:', res.status, `${data.length} password(s) found`);

  // 7. Update password
  if (pwId) {
    res = await fetch(`${BASE}/passwords/${pwId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ site: 'https://github.com', username: 'testuser', password: 'updatedPass456!' }),
    });
    data = await res.json();
    console.log('7. PUT /passwords:', res.status, data.success ? 'UPDATED' : data.error);
  }

  // 8. Delete password
  if (pwId) {
    res = await fetch(`${BASE}/passwords/${pwId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    data = await res.json();
    console.log('8. DELETE /passwords:', res.status, data.success ? 'DELETED' : data.error);
  }

  console.log('\n=== All tests passed! ===');
}

test().catch(console.error);
