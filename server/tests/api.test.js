import express from 'express';
import http from 'http';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Budget from '../models/Budget.js';

// Setup Mock Testing App
import authRoutes from '../routes/authRoutes.js';
import budgetRoutes from '../routes/budgetRoutes.js';
import expenditureRoutes from '../routes/expenditureRoutes.js';
import dashboardRoutes from '../routes/dashboardRoutes.js';

const runTests = async () => {
  console.log('--- SENTINEL-FIN INTEGRATION TESTS RUNNER ---');

  // Verify MongoDB Connection first
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  const app = express();
  app.use(express.json());

  // Mount test endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/budgets', budgetRoutes);
  app.use('/api/expenditures', expenditureRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Boot testing server
  const testPort = 5099;
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(testPort, () => {
      console.log(`Test server bound on port ${testPort}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${testPort}/api`;
  let testToken = '';
  let assertionsCount = 0;
  let failuresCount = 0;

  const assert = (condition, description) => {
    assertionsCount++;
    if (condition) {
      console.log(`[PASS] ${description}`);
    } else {
      failuresCount++;
      console.error(`[FAIL] ${description}`);
    }
  };

  try {
    // 1. HEALTH AND UNAUTHORIZED SHIELDS
    console.log('\nEvaluating authentication shield and permissions boundaries...');
    const unauthRes = await fetch(`${baseUrl}/dashboard/metrics`);
    assert(unauthRes.status === 401, 'Unauthorized request should be blocked with 401');

    // 2. INVALID LOGINS
    const invalidLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena.vance@sentinel-fin.internal', password: 'wrongpassword' })
    });
    assert(invalidLoginRes.status === 401, 'Invalid login should return 401 Unauthorized');
    const invalidJSON = await invalidLoginRes.json();
    assert(invalidJSON.success === false, 'Invalid login response success flag should be false');

    // 3. SUCCESSFUL AUTHENTICATION
    console.log('\nTesting session login and token generation...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena.vance@sentinel-fin.internal', password: 'password123' })
    });

    assert(loginRes.status === 200, 'Correct login credentials returns HTTP 200 OK');
    const loginJSON = await loginRes.json();
    assert(loginJSON.success === true, 'Success flag should be true on correct login');
    assert(!!loginJSON.token, 'Token variable should be populated');
    testToken = loginJSON.token;

    // 4. VERIFY LOGGED USER PROFILE
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    assert(meRes.status === 200, 'Authenticated profile fetch returns 200 OK');
    const meJSON = await meRes.json();
    assert(meJSON.user.email === 'elena.vance@sentinel-fin.internal', 'Me profile maps back to matching email address');

    // 5. QUERY SECURE METRICS VIA AUTH TOKEN
    console.log('\nTesting authenticated access to dashboard metrics...');
    const metricsRes = await fetch(`${baseUrl}/dashboard/metrics`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    assert(metricsRes.status === 200, 'Metric endpoint returns 200 with active JWT token');
    const metricsJSON = await metricsRes.json();
    assert(metricsJSON.totalBudget > 0, 'Total budget value must be greater than zero');

    // 6. VALIDATE EXPENDITURE LIMIT CHECKS
    console.log('\nVerifying transaction postings and budget limits validation...');
    const budgetObj = await Budget.findOne({ departmentId: 'SEC-05', status: 'active' });
    assert(!!budgetObj, 'Seeded budget for SEC-05 exists');

    // Post correct transaction
    const okTxRes = await fetch(`${baseUrl}/expenditures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        amount: 250000, // ₹2.5 Lakhs
        category: 'IDS/IPS Cybersecurity Retainers',
        description: 'Palo Alto Networks Licensing - Regular Renewal',
        transactionDate: new Date().toISOString(),
        documentReference: 'INV-TEST-001',
        departmentId: 'SEC-05'
      })
    });
    assert(okTxRes.status === 201, 'Valid transaction is successfully created (HTTP 201)');

    // Post negative amount transaction
    const errorTxRes = await fetch(`${baseUrl}/expenditures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        amount: -500,
        category: 'IDS/IPS Cybersecurity Retainers',
        description: 'Negative test',
        documentReference: 'INV-TEST-002',
        departmentId: 'SEC-05'
      })
    });
    assert(errorTxRes.status === 400, 'Negative amount transaction is rejected with 400 Bad Request');

    // Summary
    console.log(`\n--- TEST RUN SUMMARY: ${assertionsCount - failuresCount}/${assertionsCount} PASSED ---`);
    if (failuresCount > 0) {
      console.error(`Status: FAILED (${failuresCount} assertion faults detected).`);
      server.close(() => {
        process.exit(1);
      });
    } else {
      console.log('Status: ALL TESTS PASSED SUCCESSFULLY.');
      server.close(() => {
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('Testing exception encountered during execution:', err);
    server.close(() => {
      process.exit(1);
    });
  }
};

runTests();
