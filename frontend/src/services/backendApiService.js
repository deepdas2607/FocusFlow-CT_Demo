// ============================================================================
// FILE: frontend/src/services/backendApiService.js
// PURPOSE: Simple HTTP fetch functions that communicate with the Express + SQLite backend.
// ============================================================================

const RAW_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
const API_BASE_URL = RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL : `${RAW_BASE_URL}/api`;

// Safely parses a fetch response as JSON and throws a readable error if the request failed
async function parseJsonResponse(response, fallbackErrorMessage) {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${fallbackErrorMessage} (HTTP ${response.status})`);
  }
  if (!response.ok) {
    throw new Error(data.error || fallbackErrorMessage);
  }
  return data;
}

// Registers a new user account in the SQLite database
export async function registerUserOnBackend(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return parseJsonResponse(response, 'Registration failed');
}

// Authenticates an existing user with email and password against SQLite
export async function loginUserOnBackend(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return parseJsonResponse(response, 'Sign in failed');
}

// Fetches the user profile and notification preferences from SQLite
export async function fetchUserProfileFromBackend(userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const response = await fetch(`${API_BASE_URL}/user${query}`);
  const data = await parseJsonResponse(response, 'Failed to load profile');
  return data.user;
}

// Updates user profile attributes and preferences in SQLite
export async function updateUserProfileOnBackend(profileData) {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  return parseJsonResponse(response, 'Failed to update profile');
}

// Fetches aggregated dashboard stats, today's tasks, and recent sessions from SQLite
export async function fetchDashboardFromBackend(userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const response = await fetch(`${API_BASE_URL}/dashboard${query}`);
  const data = await parseJsonResponse(response, 'Failed to load dashboard');
  return data.dashboard;
}

// Fetches all tasks for the user from SQLite
export async function fetchTasksFromBackend(userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const response = await fetch(`${API_BASE_URL}/tasks${query}`);
  const data = await parseJsonResponse(response, 'Failed to load tasks');
  return data.tasks || [];
}

// Creates a new task in SQLite
export async function createTaskOnBackend(taskPayload) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskPayload)
  });
  const data = await parseJsonResponse(response, 'Failed to create task');
  return data.task;
}

// Toggles a task's completion status in SQLite
export async function completeTaskOnBackend(taskId) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
    method: 'PATCH'
  });
  const data = await parseJsonResponse(response, 'Failed to complete task');
  return data.task;
}

// Deletes a task from SQLite
export async function deleteTaskOnBackend(taskId) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE'
  });
  const data = await parseJsonResponse(response, 'Failed to delete task');
  return data.task;
}

// Fetches focus timer session history from SQLite
export async function fetchSessionsFromBackend(userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const response = await fetch(`${API_BASE_URL}/sessions${query}`);
  const data = await parseJsonResponse(response, 'Failed to load sessions');
  return data.sessions || [];
}

// Records a newly started focus timer session in SQLite
export async function startSessionOnBackend(sessionPayload) {
  const response = await fetch(`${API_BASE_URL}/sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionPayload)
  });
  const data = await parseJsonResponse(response, 'Failed to start session');
  return data.session;
}

// Marks a focus timer session as COMPLETED or ABANDONED in SQLite
export async function finishSessionOnBackend(sessionId, finalStatus) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/finish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: finalStatus })
  });
  const data = await parseJsonResponse(response, 'Failed to finish session');
  return data.session;
}

// --- WEB PUSH & VAPID BACKEND CLIENT API ---

// Fetches active VAPID keys and CleverTap dashboard instructions
export async function fetchVapidKeysFromBackend(reveal = true) {
  const query = reveal ? '?reveal=true' : '';
  const response = await fetch(`${API_BASE_URL}/push/vapid${query}`);
  return parseJsonResponse(response, 'Failed to fetch VAPID keys');
}

// Generates a fresh VAPID key pair using web-push package
export async function generateVapidKeysOnBackend() {
  const response = await fetch(`${API_BASE_URL}/push/vapid/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return parseJsonResponse(response, 'Failed to generate VAPID keys');
}

// Fetches service worker, manifest, and browser matrix status
export async function fetchWebPushStatusFromBackend() {
  const response = await fetch(`${API_BASE_URL}/push/status`);
  return parseJsonResponse(response, 'Failed to fetch Web Push status');
}

// Sends a test push payload simulation to the backend
export async function simulatePushNotificationOnBackend(payload) {
  const response = await fetch(`${API_BASE_URL}/push/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse(response, 'Failed to simulate push notification');
}

// --- WEB NATIVE DISPLAY CLIENT API ---

// Fetches predefined Web Native Display campaigns and priority rules
export async function fetchNativeDisplayCampaignsFromBackend() {
  const response = await fetch(`${API_BASE_URL}/native/campaigns`);
  return parseJsonResponse(response, 'Failed to fetch native display campaigns');
}

// Resolves competing campaign priorities according to CleverTap rules
export async function resolveNativeDisplayPrioritiesOnBackend(campaigns = []) {
  const response = await fetch(`${API_BASE_URL}/native/resolve-priority`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaigns })
  });
  return parseJsonResponse(response, 'Failed to resolve campaign priorities');
}

// Simulates a Web Native Display CustomEvent payload from the backend
export async function simulateNativeDisplayEventOnBackend(params = {}) {
  const response = await fetch(`${API_BASE_URL}/native/simulate-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return parseJsonResponse(response, 'Failed to simulate native display event');
}

// --- WEB INBOX CLIENT API ---

// Fetches all Web Inbox messages for a given user from SQLite
export async function fetchInboxMessagesFromBackend(userId = 'usr_elena_vance') {
  const response = await fetch(`${API_BASE_URL}/inbox/messages?userId=${encodeURIComponent(userId)}`);
  return parseJsonResponse(response, 'Failed to fetch inbox messages');
}

// Marks a single inbox message as read
export async function markInboxMessageReadOnBackend(msgId, userId = 'usr_elena_vance') {
  const response = await fetch(`${API_BASE_URL}/inbox/messages/${encodeURIComponent(msgId)}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return parseJsonResponse(response, 'Failed to mark inbox message as read');
}

// Marks all inbox messages as read
export async function markAllInboxMessagesReadOnBackend(userId = 'usr_elena_vance') {
  const response = await fetch(`${API_BASE_URL}/inbox/messages/read-all`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return parseJsonResponse(response, 'Failed to mark all inbox messages as read');
}

// Deletes a single inbox message from SQLite
export async function deleteInboxMessageOnBackend(msgId, userId = 'usr_elena_vance') {
  const response = await fetch(`${API_BASE_URL}/inbox/messages/${encodeURIComponent(msgId)}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });
  return parseJsonResponse(response, 'Failed to delete inbox message');
}

// Injects a realistic simulated notification into Web Inbox
export async function simulateIncomingInboxNotificationOnBackend(payload = {}) {
  const response = await fetch(`${API_BASE_URL}/inbox/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse(response, 'Failed to simulate incoming inbox notification');
}



