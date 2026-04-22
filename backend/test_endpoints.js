// Quick endpoint test script
const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'localhost', port: 5000, path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = http.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 5000, path, method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    const req = http.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('\n====== CRPS API Test Suite ======\n');

  // 1. Health check
  const health = await get('/api/health');
  console.log(`[1] GET  /api/health           → ${health.status} ${health.body.status === 'OK' ? '✅' : '❌'}`);

  // 2. Admin login
  const adminLogin = await post('/api/auth/login', { email: 'admin@barangay.gov.ph', password: 'admin123' });
  const adminOk = adminLogin.status === 200 && adminLogin.body.token;
  console.log(`[2] POST /api/auth/login (admin)   → ${adminLogin.status} ${adminOk ? '✅ Token received' : '❌ ' + JSON.stringify(adminLogin.body)}`);
  const token = adminLogin.body.token;

  // 3. Secretary login
  const secLogin = await post('/api/auth/login', { email: 'secretary@barangay.gov.ph', password: 'admin123' });
  console.log(`[3] POST /api/auth/login (secretary)→ ${secLogin.status} ${secLogin.status === 200 ? '✅' : '❌ ' + JSON.stringify(secLogin.body)}`);

  if (!token) { console.log('\n❌ Cannot continue without token.'); return; }

  // 4. Dashboard stats
  const dash = await get('/api/reports/dashboard-stats', token);
  console.log(`[4] GET  /api/reports/dashboard-stats → ${dash.status} ${dash.status === 200 ? '✅ residents=' + dash.body.residents : '❌ ' + JSON.stringify(dash.body)}`);

  // 5. Residents list
  const res = await get('/api/residents', token);
  console.log(`[5] GET  /api/residents         → ${res.status} ${res.status === 200 ? '✅ count=' + (Array.isArray(res.body) ? res.body.length : res.body.data?.length || '?') : '❌ ' + JSON.stringify(res.body)}`);

  // 6. AI Chat (should work even without NVIDIA key — local fallback)
  const chat = await post('/api/ai/chat', { message: 'Hello, what is CRPS?' });
  console.log(`[6] POST /api/ai/chat           → ${chat.status} ${chat.status === 200 ? '✅ source=' + chat.body.source : '❌ ' + JSON.stringify(chat.body)}`);

  // 7. Reports/cases
  const cases = await get('/api/reports/cases', token);
  console.log(`[7] GET  /api/reports/cases     → ${cases.status} ${cases.status === 200 ? '✅' : '❌ ' + JSON.stringify(cases.body)}`);

  // 8. Duplicate case report
  const dups = await get('/api/reports/duplicates', token);
  console.log(`[8] GET  /api/reports/duplicates→ ${dups.status} ${dups.status === 200 ? '✅' : '❌ ' + JSON.stringify(dups.body)}`);

  console.log('\n====== Test Complete ======\n');
}

run().catch(console.error);
