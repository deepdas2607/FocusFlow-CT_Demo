// ============================================================================
// FILE: frontend/src/models/focusFlowModels.js
// PURPOSE: MVVM "Model" layer — defines data shapes, default states, and options
// for Users, Tasks, Focus Sessions, Preferences, and Activity Logs.
// ============================================================================

// Returns a default user profile object before backend data loads
export function createEmptyUserModel() {
  return {
    id: 'usr_elena_vance',
    name: 'Elena Vance',
    email: 'elena.vance@focusflow.app',
    phone: '+14155552671',
    dob: '1998-05-14',
    occupation: 'Senior Product Designer',
    focusGoal: 'Deep Work',
    preferences: {
      notificationsEnabled: true,
      productivityReminders: true,
      sessionReminders: true,
      weeklySummary: true,
      marketingConsent: true,
      analyticsOptOut: false
    }
  };
}

// Formats a new task request payload before sending it to the backend SQLite API
export function createNewTaskPayload(userId, formState) {
  return {
    userId,
    title: (formState.title || '').trim(),
    description: (formState.description || '').trim(),
    category: formState.category || 'Work',
    priority: formState.priority || 'Medium',
    estimatedMinutes: Number(formState.estimatedMinutes) || 25,
    dueDate: formState.dueDate || new Date().toISOString().split('T')[0]
  };
}

// Formats a focus session request payload before starting a timer session
export function createFocusSessionPayload(userId, taskId, taskTitle, durationMinutes) {
  return {
    userId,
    taskId: taskId || null,
    taskTitle: taskTitle || 'Deep Work Focus Session',
    duration: Number(durationMinutes) || 25
  };
}

// Creates a timestamped entry for the Live Activity & Payload Inspector
export function createActivityLogEntry(source, actionName, payloadData) {
  return {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString(),
    source, // 'BACKEND_SQLITE' | 'CLEVERTAP_SDK' | 'APP_EVENT'
    actionName,
    payload: payloadData
  };
}

// Standard dropdown options used across Tasks, Focus Timer, and Profile Settings
export const TASK_CATEGORIES = ['Work', 'Learning', 'Personal', 'Health', 'Planning'];
export const TASK_PRIORITIES = ['High', 'Medium', 'Low'];
export const FOCUS_GOALS = [
  'Deep Work',
  'Exam Preparation',
  'Coding & Engineering',
  'Daily Habit Building',
  'Project Delivery'
];
export const TIMER_PRESETS = [
  { label: '10s Quick Test', minutes: 1, seconds: 10 },
  { label: '15m Sprint', minutes: 15, seconds: 15 * 60 },
  { label: '25m Pomodoro', minutes: 25, seconds: 25 * 60 },
  { label: '45m Deep Work', minutes: 45, seconds: 45 * 60 },
  { label: '60m Marathon', minutes: 60, seconds: 60 * 60 }
];
