// ============================================================================
// FILE: frontend/src/viewmodels/useFocusFlowViewModel.js
// PURPOSE: MVVM "ViewModel" layer — manages application state, timer logic,
// SQLite backend calls, and CleverTap SDK payload logging for all Views.
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import {
  createEmptyUserModel,
  createNewTaskPayload,
  createFocusSessionPayload,
  createActivityLogEntry,
  TIMER_PRESETS
} from '../models/focusFlowModels';
import {
  registerUserOnBackend,
  loginUserOnBackend,
  fetchUserProfileFromBackend,
  updateUserProfileOnBackend,
  fetchDashboardFromBackend,
  fetchTasksFromBackend,
  createTaskOnBackend,
  completeTaskOnBackend,
  deleteTaskOnBackend,
  fetchSessionsFromBackend,
  startSessionOnBackend,
  finishSessionOnBackend
} from '../services/backendApiService';
import {
  sendCleverTapUserLogin,
  sendCleverTapProfileUpdate,
  sendCleverTapEvent,
  requestCleverTapWebPushOptIn,
  sendCleverTapPrivacyUpdate
} from '../services/clevertapSdkService';

export function useFocusFlowViewModel() {
  // Navigation & UI Drawer state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Core Data state loaded from SQLite Backend
  const [user, setUser] = useState(createEmptyUserModel());
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [dashboard, setDashboard] = useState({
    tasksCompletedToday: 0,
    totalTasksCompleted: 0,
    totalTasksCount: 0,
    totalFocusSessionsCompleted: 0,
    totalFocusMinutes: 0,
    currentStreak: 0,
    todaysTasks: [],
    recentSessions: []
  });

  // Loading & Feedback banner state
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Focus Timer state
  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[2]); // Default 25m Pomodoro
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const timerIntervalRef = useRef(null);

  // Live Activity & Payload Inspector state
  const [activityLogs, setActivityLogs] = useState([]);

  // Appends a new entry to the top of the Live Activity & Payload Inspector
  function addActivityLog(source, actionName, payloadData) {
    const newEntry = createActivityLogEntry(source, actionName, payloadData);
    setActivityLogs((prev) => [newEntry, ...prev]);
  }

  // Displays a temporary toast message in the UI header
  function showStatusToast(message) {
    setStatusMessage(message);
    setErrorMessage('');
    setTimeout(() => {
      setStatusMessage((current) => (current === message ? '' : current));
    }, 4000);
  }

  // Loads user profile, tasks, focus sessions, and dashboard metrics from SQLite
  async function loadAllDataForUser(targetUserId) {
    setIsLoading(true);
    try {
      const loadedUser = await fetchUserProfileFromBackend(targetUserId);
      const userId = loadedUser.id;
      const [loadedDashboard, loadedTasks, loadedSessions] = await Promise.all([
        fetchDashboardFromBackend(userId),
        fetchTasksFromBackend(userId),
        fetchSessionsFromBackend(userId)
      ]);

      setUser(loadedUser);
      setDashboard(loadedDashboard);
      setTasks(loadedTasks);
      setSessions(loadedSessions);

      addActivityLog('BACKEND_SQLITE', 'GET /api/dashboard & /api/tasks', {
        database: 'SQLite (focusflow.db)',
        userId: loadedUser.id,
        email: loadedUser.email,
        tasksCount: loadedTasks.length,
        sessionsCount: loadedSessions.length
      });
    } catch (error) {
      setErrorMessage(error.message || 'Could not connect to SQLite backend on port 4000');
    } finally {
      setIsLoading(false);
    }
  }

  // Initial load when the application starts
  useEffect(() => {
    const savedUserId =
      typeof window !== 'undefined' ? window.sessionStorage.getItem('focusflow_user_id') : null;
    loadAllDataForUser(savedUserId || undefined);
  }, []);

  // Countdown effect when a Focus Session is actively running
  useEffect(() => {
    if (!activeSession) return;

    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleCompleteFocusSession(activeSession.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [activeSession]);

  // --- AUTHENTICATION ACTIONS ---

  // Registers a new user in SQLite and logs the CleverTap onUserLogin payload
  async function handleRegisterUser(registerForm) {
    setErrorMessage('');
    try {
      const response = await registerUserOnBackend(registerForm);
      const newUser = response.user;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('focusflow_user_id', newUser.id);
      }
      setUser(newUser);
      setIsAuthenticated(true);
      setActiveTab('dashboard');

      addActivityLog('BACKEND_SQLITE', 'POST /api/auth/register', newUser);
      const ctLoginPayload = sendCleverTapUserLogin(newUser);
      addActivityLog('CLEVERTAP_SDK', 'clevertap.onUserLogin.push (Register)', ctLoginPayload);

      await loadAllDataForUser(newUser.id);
      showStatusToast(`Welcome to FocusFlow, ${newUser.name}!`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Logs in an existing user against SQLite and logs the CleverTap onUserLogin payload
  async function handleLoginUser(loginForm) {
    setErrorMessage('');
    try {
      const response = await loginUserOnBackend(loginForm);
      const loggedInUser = response.user;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('focusflow_user_id', loggedInUser.id);
      }
      setUser(loggedInUser);
      setIsAuthenticated(true);
      setActiveTab('dashboard');

      addActivityLog('BACKEND_SQLITE', 'POST /api/auth/login', loggedInUser);
      const ctLoginPayload = sendCleverTapUserLogin(loggedInUser);
      addActivityLog('CLEVERTAP_SDK', 'clevertap.onUserLogin.push (Login)', ctLoginPayload);

      await loadAllDataForUser(loggedInUser.id);
      showStatusToast(`Signed in as ${loggedInUser.name}`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Signs out of the current session and opens the AuthView screen
  function handleSignOut() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('focusflow_user_id');
    }
    setIsAuthenticated(false);
    addActivityLog('APP_EVENT', 'User Signed Out', { previousUserId: user.id });
  }

  // --- PROFILE & SETTINGS ACTIONS ---

  // Saves updated user profile & notification preferences to SQLite and CleverTap
  async function handleSaveUserProfile(updatedProfileData) {
    setErrorMessage('');
    try {
      const payloadToSave = { ...user, ...updatedProfileData, id: user.id };
      const response = await updateUserProfileOnBackend(payloadToSave);
      setUser(response.user);

      addActivityLog('BACKEND_SQLITE', 'PUT /api/user (SQLite Update)', response.user);
      const ctProfilePayload = sendCleverTapProfileUpdate(response.user);
      addActivityLog('CLEVERTAP_SDK', 'clevertap.profile.push', ctProfilePayload);

      showStatusToast('Profile & preferences saved to SQLite database!');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Requests Web Push permission via CleverTap SDK
  function handleRequestWebPush() {
    const pushPayload = requestCleverTapWebPushOptIn();
    addActivityLog('CLEVERTAP_SDK', 'clevertap.notifications.push', pushPayload);
    showStatusToast('Triggered Web Push Opt-In request (inspect payload in drawer)');
  }

  // Updates GDPR Privacy Opt-Out flag via CleverTap SDK
  function handlePrivacyOptOutChange(optOutValue) {
    const privacyPayload = sendCleverTapPrivacyUpdate(optOutValue, false);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.privacy.push', privacyPayload);
    showStatusToast(`Privacy Opt-Out set to ${optOutValue}`);
  }

  // Fires a custom event to test CleverTap event tracking with custom properties
  function handleFireCustomEvent(eventName, eventProps) {
    const ctEvent = sendCleverTapEvent(eventName, eventProps);
    addActivityLog('CLEVERTAP_SDK', `clevertap.event.push("${eventName}")`, ctEvent);
    showStatusToast(`Fired event: "${eventName}"`);
  }

  // --- TASK MANAGEMENT ACTIONS ---

  // Creates a new task in SQLite and logs the "Task Created" event payload
  async function handleCreateTask(taskFormState) {
    if (!taskFormState.title || !taskFormState.title.trim()) return;
    setErrorMessage('');
    try {
      const taskPayload = createNewTaskPayload(user.id, taskFormState);
      const createdTask = await createTaskOnBackend(taskPayload);

      addActivityLog('BACKEND_SQLITE', 'POST /api/tasks (SQLite Insert)', createdTask);
      const ctEvent = sendCleverTapEvent('Task Created', {
        'Task ID': createdTask.id,
        'Task Title': createdTask.title,
        Category: createdTask.category,
        Priority: createdTask.priority,
        'Estimated Minutes': createdTask.estimatedMinutes
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Task Created")', ctEvent);

      await loadAllDataForUser(user.id);
      showStatusToast(`Task "${createdTask.title}" created!`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Toggles task completion in SQLite and logs the "Task Completed" event payload
  async function handleToggleTaskComplete(taskId) {
    try {
      const updatedTask = await completeTaskOnBackend(taskId);
      addActivityLog('BACKEND_SQLITE', `PATCH /api/tasks/${taskId}/complete`, updatedTask);

      if (updatedTask.completed) {
        const ctEvent = sendCleverTapEvent('Task Completed', {
          'Task ID': updatedTask.id,
          'Task Title': updatedTask.title,
          Category: updatedTask.category,
          Priority: updatedTask.priority
        });
        addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Task Completed")', ctEvent);
      }

      await loadAllDataForUser(user.id);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Deletes a task from SQLite and refreshes the task list
  async function handleDeleteTask(taskId) {
    try {
      const deletedTask = await deleteTaskOnBackend(taskId);
      addActivityLog('BACKEND_SQLITE', `DELETE /api/tasks/${taskId}`, deletedTask);
      await loadAllDataForUser(user.id);
      showStatusToast('Task deleted from SQLite');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // --- FOCUS TIMER ACTIONS ---

  // Selects a timer duration preset when the timer is not currently running
  function handleSelectTimerPreset(preset) {
    if (activeSession) return;
    setSelectedPreset(preset);
    setSecondsRemaining(preset.seconds);
  }

  // Starts a new focus session in SQLite and starts the countdown timer
  async function handleStartFocusSession() {
    if (activeSession) return;
    try {
      const linkedTask = tasks.find((t) => t.id === selectedTaskId);
      const taskTitle = linkedTask ? linkedTask.title : 'Deep Work Focus Session';
      const payload = createFocusSessionPayload(
        user.id,
        selectedTaskId || null,
        taskTitle,
        selectedPreset.minutes
      );

      const startedSession = await startSessionOnBackend(payload);
      setActiveSession(startedSession);
      setSecondsRemaining(selectedPreset.seconds);

      addActivityLog('BACKEND_SQLITE', 'POST /api/sessions/start', startedSession);
      const ctEvent = sendCleverTapEvent('Focus Session Started', {
        'Session ID': startedSession.id,
        'Task Title': startedSession.taskTitle,
        'Duration Minutes': startedSession.duration
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Focus Session Started")', ctEvent);
      showStatusToast(`Focus session started (${selectedPreset.label})`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Marks the active focus session as COMPLETED in SQLite
  async function handleCompleteFocusSession(sessionIdOverride) {
    const targetId = sessionIdOverride || activeSession?.id;
    if (!targetId) return;
    try {
      clearInterval(timerIntervalRef.current);
      const completedSession = await finishSessionOnBackend(targetId, 'COMPLETED');
      setActiveSession(null);
      setSecondsRemaining(selectedPreset.seconds);

      addActivityLog('BACKEND_SQLITE', `PATCH /api/sessions/${targetId}/finish (COMPLETED)`, completedSession);
      const ctEvent = sendCleverTapEvent('Focus Session Completed', {
        'Session ID': completedSession.id,
        'Task Title': completedSession.taskTitle,
        'Duration Minutes': completedSession.duration,
        Status: 'COMPLETED'
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Focus Session Completed")', ctEvent);

      await loadAllDataForUser(user.id);
      showStatusToast('Focus session completed! Great work!');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Marks the active focus session as ABANDONED in SQLite
  async function handleAbandonFocusSession() {
    if (!activeSession) return;
    try {
      clearInterval(timerIntervalRef.current);
      const abandonedSession = await finishSessionOnBackend(activeSession.id, 'ABANDONED');
      setActiveSession(null);
      setSecondsRemaining(selectedPreset.seconds);

      addActivityLog('BACKEND_SQLITE', `PATCH /api/sessions/${abandonedSession.id}/finish (ABANDONED)`, abandonedSession);
      const ctEvent = sendCleverTapEvent('Focus Session Abandoned', {
        'Session ID': abandonedSession.id,
        'Task Title': abandonedSession.taskTitle,
        'Duration Minutes': abandonedSession.duration,
        Status: 'ABANDONED'
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Focus Session Abandoned")', ctEvent);

      await loadAllDataForUser(user.id);
      showStatusToast('Focus session ended early');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Clears all entries in the Live Activity & Payload Inspector
  function handleClearActivityLogs() {
    setActivityLogs([]);
  }

  return {
    // Navigation & UI state
    activeTab,
    setActiveTab,
    isAuthenticated,
    setIsAuthenticated,
    isInboxOpen,
    setIsInboxOpen,
    isInspectorOpen,
    setIsInspectorOpen,
    isLoading,
    statusMessage,
    errorMessage,
    setErrorMessage,

    // Domain Models state
    user,
    setUser,
    dashboard,
    tasks,
    sessions,
    activeSession,
    selectedPreset,
    secondsRemaining,
    selectedTaskId,
    setSelectedTaskId,
    activityLogs,

    // ViewModel Action Handlers
    handleRegisterUser,
    handleLoginUser,
    handleSignOut,
    handleSaveUserProfile,
    handleRequestWebPush,
    handlePrivacyOptOutChange,
    handleFireCustomEvent,
    handleCreateTask,
    handleToggleTaskComplete,
    handleDeleteTask,
    handleSelectTimerPreset,
    handleStartFocusSession,
    handleCompleteFocusSession,
    handleAbandonFocusSession,
    handleClearActivityLogs
  };
}
