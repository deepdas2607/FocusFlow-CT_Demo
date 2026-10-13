// ============================================================================
// FILE: frontend/src/viewmodels/useFocusFlowViewModel.js
// PURPOSE: MVVM "ViewModel" layer — connects FocusFlow Views to the SQLite
// Backend API and CleverTap Web SDK methods (Identity, Events, Charged, Location,
// Increments, Offline, Debugging).
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
  CLEVERTAP_EVENTS,
  defaultCleverTapConfig,
  initializeCleverTapSdk,
  sendCleverTapUserLogin,
  sendCleverTapProfileUpdate,
  sendCleverTapEvent,
  sendCleverTapChargedEvent,
  sendCleverTapLocation,
  incrementCleverTapProfileProperty,
  decrementCleverTapProfileProperty,
  sendCleverTapPrivacyUpdate,
  updateCleverTapDebugSettings,
  updateCleverTapOfflineMode
} from '../services/clevertapSdkService';

export function useFocusFlowViewModel() {
  // Navigation & UI Drawer state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(false);

  // CleverTap Web SDK Quick Start configuration state
  const [clevertapConfig, setClevertapConfig] = useState(defaultCleverTapConfig);

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

      return { loadedUser, loadedDashboard };
    } catch (error) {
      setErrorMessage(error.message || 'Could not connect to SQLite backend on port 4000');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Initial mount: Initialize CleverTap Web SDK, fire "App Launched", and load SQLite data
  useEffect(() => {
    let initialCtConfig = defaultCleverTapConfig;
    if (typeof window !== 'undefined') {
      const savedConfigJson = window.localStorage.getItem('focusflow_ct_config');
      if (savedConfigJson) {
        try {
          initialCtConfig = { ...defaultCleverTapConfig, ...JSON.parse(savedConfigJson) };
          setClevertapConfig(initialCtConfig);
        } catch {
          // Ignore malformed localStorage config
        }
      }
    }

    // 1. Initialize CleverTap Web SDK with Account ID, Token, and Region
    const initResult = initializeCleverTapSdk(initialCtConfig);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.init (587-878-Z97Z / eu1)', initResult);

    // 2. Track "App Launched" event
    const launchEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.APP_LAUNCHED);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("App Launched")', launchEvent);

    // 3. Load user data from SQLite (defaults to Elena Vance)
    const savedUserId =
      typeof window !== 'undefined' ? window.sessionStorage.getItem('focusflow_user_id') : null;
    loadAllDataForUser(savedUserId || undefined).then((result) => {
      if (result?.loadedUser) {
        // Automatically identify Elena Vance in CleverTap
        const ctLoginPayload = sendCleverTapUserLogin(result.loadedUser, result.loadedDashboard);
        addActivityLog('CLEVERTAP_SDK', 'clevertap.onUserLogin.push (Elena Vance)', ctLoginPayload);
      }
    });
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

  // Tracks screen view events in CleverTap when switching navigation tabs
  function handleNavigateTab(nextTab) {
    setActiveTab(nextTab);
    if (nextTab === 'dashboard') {
      const ev = sendCleverTapEvent(CLEVERTAP_EVENTS.DASHBOARD_VIEWED);
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Dashboard Viewed")', ev);
    } else if (nextTab === 'progress') {
      const ev = sendCleverTapEvent(CLEVERTAP_EVENTS.PROGRESS_VIEWED);
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Progress Viewed")', ev);
    } else if (nextTab === 'settings') {
      const ev = sendCleverTapEvent(CLEVERTAP_EVENTS.PROFILE_VIEWED);
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Profile Viewed")', ev);
    }
  }

  // --- AUTHENTICATION & IDENTITY ACTIONS (clevertap.onUserLogin.push) ---

  // Registers a new user in SQLite and identifies them via clevertap.onUserLogin.push
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
      const loaded = await loadAllDataForUser(newUser.id);

      const ctLoginPayload = sendCleverTapUserLogin(newUser, loaded?.loadedDashboard);
      addActivityLog('CLEVERTAP_SDK', 'clevertap.onUserLogin.push (Register)', ctLoginPayload);

      const ctRegisterEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.USER_REGISTERED, {
        Occupation: newUser.occupation,
        'Focus Goal': newUser.focusGoal
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("User Registered")', ctRegisterEvent);

      showStatusToast(`Welcome to FocusFlow, ${newUser.name}!`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Logs in an existing user against SQLite and identifies them via clevertap.onUserLogin.push
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
      const loaded = await loadAllDataForUser(loggedInUser.id);

      const ctLoginPayload = sendCleverTapUserLogin(loggedInUser, loaded?.loadedDashboard);
      addActivityLog('CLEVERTAP_SDK', 'clevertap.onUserLogin.push (Login)', ctLoginPayload);

      const ctLoginEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.USER_LOGGED_IN, {
        Email: loggedInUser.email
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("User Logged In")', ctLoginEvent);

      showStatusToast(`Signed in as ${loggedInUser.name}`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Signs out of the current session and tracks "User Logged Out" in CleverTap
  function handleSignOut() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('focusflow_user_id');
    }
    const logoutEv = sendCleverTapEvent(CLEVERTAP_EVENTS.USER_LOGGED_OUT);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("User Logged Out")', logoutEv);
    setIsAuthenticated(false);
  }

  // --- PROFILE & CLEVERTAP QUICK START CONTROLS ---

  // Saves updated user profile & preferences to SQLite and pushes via clevertap.profile.push
  async function handleSaveUserProfile(updatedProfileData) {
    setErrorMessage('');
    try {
      const payloadToSave = { ...user, ...updatedProfileData, id: user.id };
      const response = await updateUserProfileOnBackend(payloadToSave);
      setUser(response.user);

      addActivityLog('BACKEND_SQLITE', 'PUT /api/user (SQLite Update)', response.user);

      const ctProfilePayload = sendCleverTapProfileUpdate(
        { ...response.user, isPro: isProUser },
        dashboard
      );
      addActivityLog('CLEVERTAP_SDK', 'clevertap.profile.push', ctProfilePayload);

      const settingsEv = sendCleverTapEvent(CLEVERTAP_EVENTS.SETTINGS_UPDATED, {
        'Focus Goal': response.user.focusGoal,
        'Notifications Enabled': Boolean(response.user.preferences?.notificationsEnabled)
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Settings Updated")', settingsEv);

      showStatusToast('Profile saved to SQLite & pushed via clevertap.profile.push!');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Manually triggers clevertap.onUserLogin.push and tracks a companion event for instant dashboard verification
  function handleManualOnUserLoginPush() {
    const ctLoginPayload = sendCleverTapUserLogin({ ...user, isPro: isProUser }, dashboard);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.onUserLogin.push (Manual)', ctLoginPayload);

    // Also track a live event so it appears instantly under Analytics -> Live / Real-Time in the CleverTap dashboard
    const syncEvent = sendCleverTapEvent('User Profile Identified', {
      Email: user.email || 'elena.vance@focusflow.app',
      Name: user.name || 'Elena Vance',
      Identity: user.email || 'elena.vance@focusflow.app',
      'Action Source': 'Manual Push onUserLogin Button'
    });
    addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("User Profile Identified")', syncEvent);

    showStatusToast(`Identified ${user.name} (${user.email}) in CleverTap`);
  }

  // Manually triggers clevertap.profile.push
  function handleManualProfilePush() {
    const ctProfilePayload = sendCleverTapProfileUpdate({ ...user, isPro: isProUser }, dashboard);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.profile.push (Manual)', ctProfilePayload);
    showStatusToast('Pushed clevertap.profile.push for ' + user.name);
  }

  // Re-initializes CleverTap SDK with updated Account ID, Token, Region, or Target Domain
  function handleUpdateCleverTapConfig(updatedConfig) {
    const merged = { ...clevertapConfig, ...updatedConfig };
    setClevertapConfig(merged);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('focusflow_ct_config', JSON.stringify(merged));
    }
    const initResult = initializeCleverTapSdk(merged);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.init (Updated Config)', initResult);
    showStatusToast(`CleverTap SDK initialized (Account: ${merged.accountId}, Region: ${merged.region})`);
  }

  // Records Customer Purchase via "Charged" special event in CleverTap
  function handlePurchaseProPlan(planType = 'Annual', paymentMode = 'Credit Card') {
    const isAnnual = planType === 'Annual';
    const chargePayload = {
      amount: isAnnual ? 29.99 : 9.99,
      paymentMode,
      chargedId: `CHG_${Date.now()}`,
      items: isAnnual
        ? [
            {
              Category: 'Subscription',
              'Item name': 'FocusFlow Pro Annual Plan',
              Quantity: 1,
              Price: 24.99
            },
            {
              Category: 'Add-on',
              'Item name': 'Deep Work Ambient Soundtrack Pack',
              Quantity: 1,
              Price: 5.0
            }
          ]
        : [
            {
              Category: 'Subscription',
              'Item name': 'FocusFlow Pro Monthly Plan',
              Quantity: 1,
              Price: 9.99
            }
          ]
    };

    // 1. Fire CleverTap "Charged" special event
    const chargedResult = sendCleverTapChargedEvent(chargePayload);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Charged")', chargedResult);

    // 2. Enrich profile with Customer Type and Plan
    setIsProUser(true);
    const ctProf = sendCleverTapProfileUpdate(
      { ...user, isPro: true },
      dashboard
    );
    addActivityLog('CLEVERTAP_SDK', 'clevertap.profile.push (Customer Type: Pro Member)', ctProf);

    // 3. Increment total purchases count
    const incResult = incrementCleverTapProfileProperty('Total Purchases', 1);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.handleIncrementValue("Total Purchases", 1)', incResult);

    setIsProModalOpen(false);
    showStatusToast(`🎉 Upgraded to FocusFlow Pro! Charged event pushed to CleverTap.`);
  }

  // Updates user location in CleverTap via clevertap.getLocation(lat, lng)
  function handleSetLocation(lat = null, lng = null) {
    const locResult = sendCleverTapLocation(lat, lng);
    addActivityLog('CLEVERTAP_SDK', locResult.method, locResult);
    showStatusToast(`Updated user location in CleverTap (${locResult.method})`);
  }

  // Increments numeric profile property in CleverTap
  function handleIncrementProperty(propName, amount = 1) {
    const incResult = incrementCleverTapProfileProperty(propName, amount);
    addActivityLog('CLEVERTAP_SDK', incResult.method, incResult);
    showStatusToast(`Incremented "${propName}" by ${amount}`);
  }

  // Decrements numeric profile property in CleverTap
  function handleDecrementProperty(propName, amount = 1) {
    const decResult = decrementCleverTapProfileProperty(propName, amount);
    addActivityLog('CLEVERTAP_SDK', decResult.method, decResult);
    showStatusToast(`Decremented "${propName}" by ${amount}`);
  }

  // Updates GDPR Privacy optOut and useIP flags via clevertap.privacy.push
  function handlePrivacyChange(optOutBoolean, useIpBoolean) {
    const nextConfig = {
      ...clevertapConfig,
      optOut: Boolean(optOutBoolean),
      useIP: Boolean(useIpBoolean)
    };
    setClevertapConfig(nextConfig);
    const privacyResult = sendCleverTapPrivacyUpdate(optOutBoolean, useIpBoolean);
    addActivityLog('CLEVERTAP_SDK', 'clevertap.privacy.push', privacyResult);

    const consentEv = sendCleverTapEvent(CLEVERTAP_EVENTS.CONSENT_UPDATED, {
      'Tracking Opted Out': Boolean(optOutBoolean),
      'IP Collection Enabled': Boolean(useIpBoolean)
    });
    addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Consent Updated")', consentEv);

    showStatusToast(`Updated privacy: optOut=${Boolean(optOutBoolean)}, useIP=${Boolean(useIpBoolean)}`);
  }

  // Updates CleverTap log level (0, 1, 2, 3) and sessionStorage['WZRK_D']
  function handleDebugLevelChange(newLogLevel, enableWzrkDebug) {
    const nextConfig = {
      ...clevertapConfig,
      logLevel: Number(newLogLevel),
      wzrkDebug: Boolean(enableWzrkDebug)
    };
    setClevertapConfig(nextConfig);
    const debugResult = updateCleverTapDebugSettings(newLogLevel, enableWzrkDebug);
    addActivityLog('CLEVERTAP_SDK', `clevertap.setLogLevel(${newLogLevel})`, debugResult);
    showStatusToast(`Set CleverTap Log Level to ${newLogLevel}`);
  }

  // Toggles CleverTap Offline Mode (clevertap.setOffline(true/false))
  function handleToggleOfflineMode(isOfflineBoolean) {
    const nextConfig = {
      ...clevertapConfig,
      isOffline: Boolean(isOfflineBoolean)
    };
    setClevertapConfig(nextConfig);
    const offlineResult = updateCleverTapOfflineMode(isOfflineBoolean);
    addActivityLog('CLEVERTAP_SDK', `clevertap.setOffline(${Boolean(isOfflineBoolean)})`, offlineResult);
    showStatusToast(
      isOfflineBoolean
        ? 'CleverTap Offline Mode ENABLED (events queued locally)'
        : 'CleverTap Offline Mode DISABLED (queued events flushed to server)'
    );
  }

  // Fires a custom event with or without properties via clevertap.event.push
  function handleFireCustomEvent(eventName, eventProps) {
    const ctEvent = sendCleverTapEvent(eventName, eventProps);
    addActivityLog('CLEVERTAP_SDK', `clevertap.event.push("${eventName}")`, ctEvent);
    showStatusToast(`Fired CleverTap event: "${eventName}"`);
  }

  // --- TASK MANAGEMENT ACTIONS (clevertap.event.push) ---

  // Creates a new task in SQLite and pushes "Task Created" to CleverTap
  async function handleCreateTask(taskFormState) {
    if (!taskFormState.title || !taskFormState.title.trim()) return;
    setErrorMessage('');
    try {
      const taskPayload = createNewTaskPayload(user.id, taskFormState);
      const createdTask = await createTaskOnBackend(taskPayload);

      addActivityLog('BACKEND_SQLITE', 'POST /api/tasks (SQLite Insert)', createdTask);

      const ctEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.TASK_CREATED, {
        Category: createdTask.category,
        Priority: createdTask.priority,
        'Title Length': createdTask.title.length,
        'Estimated Minutes': createdTask.estimatedMinutes
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Task Created")', ctEvent);

      await loadAllDataForUser(user.id);
      showStatusToast(`Task "${createdTask.title}" created & tracked in CleverTap!`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Toggles task completion in SQLite and pushes "Task Completed" + profile increments to CleverTap
  async function handleToggleTaskComplete(taskId) {
    try {
      const updatedTask = await completeTaskOnBackend(taskId);
      addActivityLog('BACKEND_SQLITE', `PATCH /api/tasks/${taskId}/complete`, updatedTask);

      const loaded = await loadAllDataForUser(user.id);

      if (updatedTask.completed) {
        const ctEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.TASK_COMPLETED, {
          Category: updatedTask.category,
          Priority: updatedTask.priority,
          'Time Taken (minutes)': updatedTask.estimatedMinutes || 25
        });
        addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Task Completed")', ctEvent);

        // Increment Total Tasks Completed
        const incResult = incrementCleverTapProfileProperty('Total Tasks Completed', 1);
        addActivityLog('CLEVERTAP_SDK', 'clevertap.handleIncrementValue("Total Tasks Completed", 1)', incResult);

        if (loaded) {
          const ctProf = sendCleverTapProfileUpdate(
            { ...loaded.loadedUser, isPro: isProUser },
            loaded.loadedDashboard
          );
          addActivityLog('CLEVERTAP_SDK', 'clevertap.profile.push (Updated Task Stats)', ctProf);
        }
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // Deletes a task from SQLite and pushes "Task Deleted" to CleverTap
  async function handleDeleteTask(taskId) {
    try {
      const deletedTask = await deleteTaskOnBackend(taskId);
      addActivityLog('BACKEND_SQLITE', `DELETE /api/tasks/${taskId}`, deletedTask);

      const ctEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.TASK_DELETED, {
        Category: deletedTask.category,
        Priority: deletedTask.priority
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Task Deleted")', ctEvent);

      await loadAllDataForUser(user.id);
      showStatusToast('Task deleted from SQLite');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // --- FOCUS TIMER ACTIONS (clevertap.event.push & handleIncrementValue) ---

  function handleSelectTimerPreset(preset) {
    if (activeSession) return;
    setSelectedPreset(preset);
    setSecondsRemaining(preset.seconds);
  }

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

      const ctEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.FOCUS_SESSION_STARTED, {
        'Duration (minutes)': startedSession.duration,
        'Task Category': linkedTask ? linkedTask.category : 'None',
        'Has Linked Task': Boolean(linkedTask),
        'Hour of Day': new Date().getHours()
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Focus Session Started")', ctEvent);
      showStatusToast(`Focus session started (${selectedPreset.label})`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCompleteFocusSession(sessionIdOverride) {
    const targetId = sessionIdOverride || activeSession?.id;
    if (!targetId) return;
    try {
      clearInterval(timerIntervalRef.current);
      const completedSession = await finishSessionOnBackend(targetId, 'COMPLETED');
      setActiveSession(null);
      setSecondsRemaining(selectedPreset.seconds);

      addActivityLog('BACKEND_SQLITE', `PATCH /api/sessions/${targetId}/finish (COMPLETED)`, completedSession);

      const loaded = await loadAllDataForUser(user.id);
      const linkedTask = tasks.find((t) => t.id === completedSession.taskId);

      const ctEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.FOCUS_SESSION_COMPLETED, {
        'Duration (minutes)': completedSession.duration,
        'Task Category': linkedTask ? linkedTask.category : 'None',
        'Completed On Time': true,
        'Elapsed Minutes': completedSession.duration,
        'Total Completed Sessions': loaded?.loadedDashboard?.totalFocusSessionsCompleted ?? 1
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Focus Session Completed")', ctEvent);

      // Increment Total Focus Minutes & Sessions Completed in profile
      incrementCleverTapProfileProperty('Total Focus Minutes', completedSession.duration);
      incrementCleverTapProfileProperty('Total Sessions Completed', 1);

      if (loaded) {
        const ctProf = sendCleverTapProfileUpdate(
          { ...loaded.loadedUser, isPro: isProUser },
          loaded.loadedDashboard
        );
        addActivityLog('CLEVERTAP_SDK', 'clevertap.profile.push (Updated Focus Metrics)', ctProf);
      }

      showStatusToast('Focus session completed & synced to CleverTap!');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleAbandonFocusSession() {
    if (!activeSession) return;
    try {
      clearInterval(timerIntervalRef.current);
      const totalPresetSecs = selectedPreset.seconds || 1500;
      const elapsedSecs = Math.max(0, totalPresetSecs - secondsRemaining);
      const completionPercentage = Math.round((elapsedSecs / totalPresetSecs) * 100);

      const abandonedSession = await finishSessionOnBackend(activeSession.id, 'ABANDONED');
      setActiveSession(null);
      setSecondsRemaining(selectedPreset.seconds);

      addActivityLog('BACKEND_SQLITE', `PATCH /api/sessions/${abandonedSession.id}/finish (ABANDONED)`, abandonedSession);

      const linkedTask = tasks.find((t) => t.id === abandonedSession.taskId);

      const ctEvent = sendCleverTapEvent(CLEVERTAP_EVENTS.FOCUS_SESSION_ABANDONED, {
        'Duration (minutes)': abandonedSession.duration,
        'Elapsed Minutes': Math.max(1, Math.round(elapsedSecs / 60)),
        'Task Category': linkedTask ? linkedTask.category : 'None',
        'Completion Percentage': completionPercentage
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Focus Session Abandoned")', ctEvent);

      await loadAllDataForUser(user.id);
      showStatusToast('Focus session abandoned & tracked in CleverTap');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleClearActivityLogs() {
    setActivityLogs([]);
  }

  return {
    // Navigation & UI state
    activeTab,
    setActiveTab: handleNavigateTab,
    isAuthenticated,
    setIsAuthenticated,
    isInspectorOpen,
    setIsInspectorOpen,
    isProModalOpen,
    setIsProModalOpen,
    isProUser,
    isLoading,
    statusMessage,
    errorMessage,
    setErrorMessage,

    // CleverTap Quick Start Config State
    clevertapConfig,

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
    handleManualOnUserLoginPush,
    handleManualProfilePush,
    handleUpdateCleverTapConfig,
    handlePurchaseProPlan,
    handleSetLocation,
    handleIncrementProperty,
    handleDecrementProperty,
    handlePrivacyChange,
    handleDebugLevelChange,
    handleToggleOfflineMode,
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
