// Complete end-to-end test script for FocusFlow backend APIs
const API_URL = 'http://localhost:4000';

async function testFlow() {
  console.log('=== FocusFlow API Verification Suite ===\n');

  // 1. Register a new user
  const email = `testuser_${Date.now()}@example.com`;
  console.log(`1. Testing Registration for ${email}...`);
  const regRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Developer',
      email,
      password: 'password123',
    }),
  });
  const regData = await regRes.json();
  if (!regRes.ok) throw new Error(`Register failed: ${JSON.stringify(regData)}`);
  console.log('✓ Registration successful:', regData.message);
  const token = regData.token;

  // 2. Testing GET /api/auth/me
  console.log('\n2. Testing GET /api/auth/me...');
  const meRes = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  if (!meRes.ok) throw new Error(`Me failed: ${JSON.stringify(meData)}`);
  console.log('✓ Retrieved current user:', meData.user.name, `(${meData.user.email})`);

  // 3. Testing POST /api/tasks (Create Task)
  console.log('\n3. Testing POST /api/tasks (Create Task)...');
  const taskRes = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Complete CleverTap Web SDK Integration',
      description: 'Setup user profile sync and event tracking',
      category: 'Work',
      priority: 'High',
    }),
  });
  const taskData = await taskRes.json();
  if (!taskRes.ok) throw new Error(`Create task failed: ${JSON.stringify(taskData)}`);
  console.log('✓ Task created successfully, ID:', taskData.task.id);
  const taskId = taskData.task.id;

  // 4. Testing GET /api/tasks
  console.log('\n4. Testing GET /api/tasks...');
  const listTasksRes = await fetch(`${API_URL}/api/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listTasksData = await listTasksRes.json();
  console.log('✓ Fetched tasks count:', listTasksData.tasks.length);

  // 5. Testing POST /api/focus/start
  console.log('\n5. Testing POST /api/focus/start...');
  const focusRes = await fetch(`${API_URL}/api/focus/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      taskId,
      duration: 25,
    }),
  });
  const focusData = await focusRes.json();
  if (!focusRes.ok) throw new Error(`Start focus failed: ${JSON.stringify(focusData)}`);
  console.log('✓ Focus session started, ID:', focusData.session.id, 'isFirstSession:', focusData.isFirstSession);
  const sessionId = focusData.session.id;

  // 6. Testing POST /api/focus/:id/complete
  console.log(`\n6. Testing POST /api/focus/${sessionId}/complete...`);
  const completeFocusRes = await fetch(`${API_URL}/api/focus/${sessionId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const completeFocusData = await completeFocusRes.json();
  if (!completeFocusRes.ok) throw new Error(`Complete focus failed: ${JSON.stringify(completeFocusData)}`);
  console.log('✓ Focus session completed successfully. Total completed:', completeFocusData.totalCompletedSessions);

  // 7. Testing POST /api/tasks/:id/complete
  console.log(`\n7. Testing POST /api/tasks/${taskId}/complete...`);
  const completeTaskRes = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const completeTaskData = await completeTaskRes.json();
  if (!completeTaskRes.ok) throw new Error(`Complete task failed: ${JSON.stringify(completeTaskData)}`);
  console.log('✓ Task completed successfully, isFirstCompletion:', completeTaskData.isFirstCompletion);

  // 8. Testing PUT /api/profile
  console.log('\n8. Testing PUT /api/profile...');
  const profileRes = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Alex Developer (Updated)',
      occupation: 'Senior Full Stack Engineer',
      interests: 'typescript, react, clevertap, nodejs',
      preferredFocusDuration: 45,
      notificationsEnabled: true,
      productivityReminders: true,
      sessionReminders: true,
      weeklySummary: true,
    }),
  });
  const profileData = await profileRes.json();
  if (!profileRes.ok) throw new Error(`Update profile failed: ${JSON.stringify(profileData)}`);
  console.log('✓ Profile updated successfully:', profileData.user.name, profileData.user.occupation);

  // 9. Testing GET /api/dashboard
  console.log('\n9. Testing GET /api/dashboard...');
  const dashRes = await fetch(`${API_URL}/api/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dashData = await dashRes.json();
  if (!dashRes.ok) throw new Error(`Dashboard failed: ${JSON.stringify(dashData)}`);
  console.log('✓ Dashboard stats:');
  console.log('  - Total Tasks Completed:', dashData.totalTasksCompleted);
  console.log('  - Total Focus Sessions Completed:', dashData.totalFocusSessionsCompleted);
  console.log('  - Total Focus Minutes:', dashData.totalFocusMinutes);
  console.log('  - Tasks Completed Today:', dashData.tasksCompletedToday);
  console.log('  - Current Streak:', dashData.currentStreak);

  console.log('\n🎉 ALL 9 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!\n');
}

testFlow().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
