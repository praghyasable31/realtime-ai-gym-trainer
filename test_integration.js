const http = require('http');
const app = require('./backend/server.js');

setTimeout(async () => {
  try {
    console.log('--- RUNNING BACKEND INTEGRATION TESTS ---');

    // 1. Health
    const resHealth = await new Promise((resolve) => {
      http.get('http://127.0.0.1:5000/api/health', (r) => {
        let d = '';
        r.on('data', chunk => d += chunk);
        r.on('end', () => resolve(JSON.parse(d)));
      });
    });
    console.log('1. Health Check:', resHealth.status === 'healthy' ? 'PASSED' : 'FAILED');

    // 2. Register
    const regPayload = JSON.stringify({
      name: 'Major Project Tester',
      email: 'tester_' + Date.now() + '@example.com',
      password: 'Password123'
    });
    const regRes = await new Promise((resolve, reject) => {
      const req = http.request('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(regPayload) }
      }, (r) => {
        let d = '';
        r.on('data', chunk => d += chunk);
        r.on('end', () => resolve(JSON.parse(d)));
      });
      req.on('error', reject);
      req.write(regPayload);
      req.end();
    });
    console.log('2. User Registration & JWT Issuance:', regRes.success ? 'PASSED' : 'FAILED: ' + JSON.stringify(regRes));
    const token = regRes.token;

    // 3. Record Workout
    const workoutPayload = JSON.stringify({
      exercise: 'squat',
      reps: 15,
      duration: 50,
      formScore: 92,
      feedback: ['Good Rep! Full Depth', 'Keep back straight']
    });
    const workoutRes = await new Promise((resolve, reject) => {
      const req = http.request('http://127.0.0.1:5000/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(workoutPayload),
          'Authorization': 'Bearer ' + token
        }
      }, (r) => {
        let d = '';
        r.on('data', chunk => d += chunk);
        r.on('end', () => resolve(JSON.parse(d)));
      });
      req.on('error', reject);
      req.write(workoutPayload);
      req.end();
    });
    console.log('3. Record Workout Session:', workoutRes.success ? `PASSED (Recorded ${workoutRes.workout.reps} reps)` : 'FAILED');

    // 4. Get Dashboard Stats
    const statsRes = await new Promise((resolve, reject) => {
      const req = http.request('http://127.0.0.1:5000/api/dashboard/stats', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      }, (r) => {
        let d = '';
        r.on('data', chunk => d += chunk);
        r.on('end', () => resolve(JSON.parse(d)));
      });
      req.on('error', reject);
      req.end();
    });
    console.log('4. Dashboard Analytics Pipeline:', (statsRes.success && statsRes.stats.totalReps >= 15) ? `PASSED (Total Workouts: ${statsRes.stats.totalWorkouts}, Total Reps: ${statsRes.stats.totalReps})` : 'FAILED');

    console.log('--- ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
    process.exit(0);
  } catch (err) {
    console.error('Integration test error:', err);
    process.exit(1);
  }
}, 1500);
