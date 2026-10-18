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
  finishSessionOnBackend,
  fetchVapidKeysFromBackend,
  generateVapidKeysOnBackend,
  fetchWebPushStatusFromBackend,
  simulatePushNotificationOnBackend,
  fetchNativeDisplayCampaignsFromBackend,
  resolveNativeDisplayPrioritiesOnBackend,
  simulateNativeDisplayEventOnBackend,
  fetchInboxMessagesFromBackend,
  markInboxMessageReadOnBackend,
  markAllInboxMessagesReadOnBackend,
  deleteInboxMessageOnBackend,
  simulateIncomingInboxNotificationOnBackend
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
  updateCleverTapOfflineMode,
  updateCleverTapDismissSpamControl,
  closeCleverTapBoxPopup,
  closeCleverTapBannerPopup,
  closeCleverTapInterstitialPopup,
  closeCleverTapImageOnlyPopup,
  closeCleverTapPipPopup,
  closeActiveCleverTapPopup,
  handleSpaRoutePopupDismissal,
  registerCleverTapNotificationCallback,
  renderCleverTapNotificationViewed,
  renderCleverTapNotificationClicked,
  registerCleverTapPopupCallback,
  raiseCleverTapPopupNotificationClicked,
  setupCleverTapExitIntentListener,
  PIP_ANCHOR_POSITIONS,
  getPipPositionClasses,
  resolvePipClickAction,
  getCleverTapInstance,
  getCleverTapSdkVersion,
  getBrowserWebPushSupport,
  getNotificationPermissionStatus,
  requestNativeBrowserPermission,
  getPushRejectionCooldown,
  recordPushRejection,
  clearPushRejectionCooldown,
  requestCleverTapPushPermission,
  evaluateTokenMigration,
  checkServiceWorkerRegistration,
  CT_NATIVE_EVENTS,
  dispatchCleverTapNativeDisplayEvent,
  registerCleverTapNativeDisplayListener,
  renderCartDropOffPersonalisationCampaign,
  renderStreakPersonalisationCampaign,
  renderProOfferPersonalisationCampaign,
  resolveNativeDisplayPriorities,
  INBOX_POSITION_MODES,
  setCleverTapInboxMessages,
  getCleverTapInboxMessageCount,
  getCleverTapInboxMessageUnreadCount,
  getAllCleverTapInboxMessages,
  getUnreadCleverTapInboxMessages,
  getCleverTapInboxMessageForId,
  deleteCleverTapInboxMessage,
  markReadCleverTapInboxMessage,
  markReadAllCleverTapInboxMessages,
  renderCleverTapInboxNotificationViewed,
  renderCleverTapInboxNotificationClicked,
  calculateWebInboxPosition
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

  // Web Pop-ups & Exit Intent state
  const [activePopup, setActivePopup] = useState(null);
  const [dismissSpamControl, setDismissSpamControl] = useState(true);
  const [exitIntentEnabled, setExitIntentEnabled] = useState(true);
  const [shownCampaignsInSession, setShownCampaignsInSession] = useState({});
  const [pipConfig, setPipConfig] = useState({
    anchor: 'bottom-right',
    isPlaying: true,
    isMuted: true,
    isExpanded: false,
    dragEnabled: true
  });
  const [customNotificationMsg, setCustomNotificationMsg] = useState(null);
  const [popupAnalytics, setPopupAnalytics] = useState({
    viewedCount: 0,
    clickedCount: 0,
    dismissedCount: 0,
    spamBlockedCount: 0,
    exitIntentTriggers: 0
  });

  // Web Push & VAPID Protocol state
  const [pushPermissionStatus, setPushPermissionStatus] = useState('default');
  const [sdkVersionInfo, setSdkVersionInfo] = useState(null);
  const [browserPushSupport, setBrowserPushSupport] = useState(null);
  const [vapidKeys, setVapidKeys] = useState(null);
  const [isLoadingVapid, setIsLoadingVapid] = useState(false);
  const [pushCooldownInfo, setPushCooldownInfo] = useState(null);
  const [softPromptOptions, setSoftPromptOptions] = useState({
    titleText: 'Would you like to receive Push Notifications?',
    bodyText: 'We promise to only send you relevant content and give you updates on your transactions',
    okButtonText: 'Sign me up!',
    rejectButtonText: 'No thanks',
    okButtonColor: '#4f46e5',
    askAgainTimeInSeconds: 5,
    serviceWorkerPath: '/clevertap_sw.js'
  });
  const [migrationResult, setMigrationResult] = useState(null);
  const [simulatedPushResult, setSimulatedPushResult] = useState(null);

  // Web Native Display state
  const [nativeDisplayData, setNativeDisplayData] = useState(null);
  const [activeNativeTopic, setActiveNativeTopic] = useState(null);
  const [nativeCampaignsList, setNativeCampaignsList] = useState([]);
  const [priorityResults, setPriorityResults] = useState(null);
  const [isResolvingPriority, setIsResolvingPriority] = useState(false);

  // Web Inbox (<ct-web-inbox>) state
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [inboxPosition, setInboxPosition] = useState(INBOX_POSITION_MODES.TOP_RIGHT);
  const [inboxStyles, setInboxStyles] = useState({
    width: '392px',
    height: '546px',
    fontFamily: 'inherit'
  });
  const [inboxPositionStyle, setInboxPositionStyle] = useState({});
  const [inboxApiTestResult, setInboxApiTestResult] = useState(null);

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
      const [loadedDashboard, loadedTasks, loadedSessions, loadedInbox] = await Promise.all([
        fetchDashboardFromBackend(userId),
        fetchTasksFromBackend(userId),
        fetchSessionsFromBackend(userId),
        fetchInboxMessagesFromBackend(userId).catch(() => ({ messages: [] }))
      ]);

      setUser(loadedUser);
      setDashboard(loadedDashboard);
      setTasks(loadedTasks);
      setSessions(loadedSessions);
      if (loadedInbox?.messages) {
        setInboxMessages(loadedInbox.messages);
        setCleverTapInboxMessages(loadedInbox.messages);
      }

      addActivityLog('BACKEND_SQLITE', 'GET /api/dashboard, /api/tasks & /api/inbox/messages', {
        database: 'SQLite (focusflow.db)',
        userId: loadedUser.id,
        email: loadedUser.email,
        tasksCount: loadedTasks.length,
        sessionsCount: loadedSessions.length,
        inboxCount: loadedInbox?.messages?.length || 0
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
    let initialCtConfig = { ...defaultCleverTapConfig, region: 'eu1' };
    if (typeof window !== 'undefined') {
      const savedConfigJson = window.localStorage.getItem('focusflow_ct_config');
      if (savedConfigJson) {
        try {
          const parsed = JSON.parse(savedConfigJson);
          initialCtConfig = { ...defaultCleverTapConfig, ...parsed, region: parsed.region || 'eu1' };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Web Push initialization: detect browser capability, SDK version, permission, and fetch VAPID keys
  useEffect(() => {
    setPushPermissionStatus(getNotificationPermissionStatus());
    setSdkVersionInfo(getCleverTapSdkVersion());
    setBrowserPushSupport(getBrowserWebPushSupport());
    setPushCooldownInfo(getPushRejectionCooldown(softPromptOptions.askAgainTimeInSeconds));

    fetchVapidKeysFromBackend(true)
      .then((data) => {
        if (data?.keys) {
          setVapidKeys(data.keys);
        }
      })
      .catch((err) => {
        console.warn('[ViewModel] Initial fetchVapidKeys error:', err);
      });
  }, [softPromptOptions.askAgainTimeInSeconds]);

  // Web Native Display: Register listener for "CT_web_native_display" and fetch campaigns
  useEffect(() => {
    // 1. Register listener for document event "CT_web_native_display"
    const cleanupListener = registerCleverTapNativeDisplayListener((data) => {
      const topic = data?.kv?.topic;
      if (topic) {
        setActiveNativeTopic(topic);
        setNativeDisplayData(data);
        if (topic === 'Cart drop-off') {
          renderCartDropOffPersonalisationCampaign(data);
        } else if (topic === 'Focus Streak Milestone') {
          renderStreakPersonalisationCampaign(data);
        } else if (topic === 'Pro Upgrade Offer') {
          renderProOfferPersonalisationCampaign(data);
        }
        addActivityLog('CLEVERTAP_NATIVE', `CT_web_native_display received [Topic: "${topic}"]`, data);
      }
    });

    // 2. Fetch native campaigns from backend & evaluate initial priority
    fetchNativeDisplayCampaignsFromBackend()
      .then((resp) => {
        if (resp?.campaigns) {
          setNativeCampaignsList(resp.campaigns);
          const initialPriorities = resolveNativeDisplayPriorities(resp.campaigns);
          setPriorityResults(initialPriorities);
        }
      })
      .catch((err) => {
        console.warn('[ViewModel] Initial fetchNativeDisplayCampaigns error:', err);
      });

    return () => {
      cleanupListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  // Tracks screen view events in CleverTap and handles SPA route change pop-up auto-dismissal
  function handleNavigateTab(nextTab) {
    // 1. SPA Route Change Pop-up Auto-Dismissal
    // When clevertap.spa is true, active Box, Banner, and Image Only popups are automatically dismissed
    if (clevertapConfig.spa && activePopup) {
      if (['box', 'banner', 'imageOnly'].includes(activePopup.type)) {
        const spaResult = handleSpaRoutePopupDismissal();
        setActivePopup(null);
        addActivityLog(
          'CLEVERTAP_POPUP',
          `[SPA Auto-Dismissal] clevertap.spa closed ${activePopup.type} on navigation`,
          {
            closedTemplate: activePopup.type,
            routeFrom: activeTab,
            routeTo: nextTab,
            clevertapSpa: true,
            ...spaResult
          }
        );
      }
    }

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
    } else if (nextTab === 'popups') {
      const ev = sendCleverTapEvent('Web Popups Studio Viewed', {
        'User ID': user.id,
        'Dismiss Spam Control': dismissSpamControl,
        'Exit Intent Enabled': exitIntentEnabled
      });
      addActivityLog('CLEVERTAP_SDK', 'clevertap.event.push("Web Popups Studio Viewed")', ev);
    }
  }

  // Effect: Desktop Exit Intent Listener (triggers when cursor moves towards browser top edge)
  useEffect(() => {
    if (!exitIntentEnabled) return;

    const cleanup = setupCleverTapExitIntentListener((eventData) => {
      const campaignId = 'camp_exit_intent_streak_saver';
      if (!dismissSpamControl && shownCampaignsInSession[campaignId]) {
        addActivityLog('CLEVERTAP_POPUP', 'Exit Intent Blocked (dismissSpamControl = false)', {
          reason: 'Campaign already dismissed once in this session',
          campaignId,
          dismissSpamControl
        });
        setPopupAnalytics((prev) => ({ ...prev, spamBlockedCount: prev.spamBlockedCount + 1 }));
        return;
      }

      setActivePopup((current) => {
        if (current) return current;
        const msgId = `${campaignId}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
        const pivotId = 'Variant_Exit_StreakSaver';
        const exitPopup = {
          id: 'intentPreview',
          type: 'interstitial',
          isExitIntent: true,
          campaignId,
          pivotId,
          msgId,
          title: 'Wait! Don’t Break Your Focus Streak!',
          description: `You are currently on a ${dashboard.currentStreak || 1}-day streak! Complete one 25-minute Pomodoro session today to keep your streak intact.`,
          c2aText: 'Stay & Focus (25m)',
          secondaryText: 'Leave Website',
          kv: { intent_source: 'desktop_window_exit', discount_pct: '25' }
        };

        renderCleverTapNotificationViewed({ msgId, pivotId });
        addActivityLog('CLEVERTAP_POPUP', 'clevertap.renderNotificationViewed (Exit Intent Interstitial)', {
          ...eventData,
          popup: exitPopup
        });

        setShownCampaignsInSession((prev) => ({ ...prev, [campaignId]: true }));
        setPopupAnalytics((prev) => ({
          ...prev,
          viewedCount: prev.viewedCount + 1,
          exitIntentTriggers: prev.exitIntentTriggers + 1
        }));

        return exitPopup;
      });
    });

    return cleanup;
  }, [exitIntentEnabled, dismissSpamControl, shownCampaignsInSession, dashboard.currentStreak]);

  // Effect: Register CleverTap Custom Callbacks (notificationCallback & popupCallback)
  useEffect(() => {
    registerCleverTapNotificationCallback((msg) => {
      setCustomNotificationMsg(msg);
      addActivityLog('CLEVERTAP_POPUP', 'clevertap.notificationCallback received', msg);
    });

    registerCleverTapPopupCallback((data) => {
      addActivityLog('CLEVERTAP_POPUP', 'clevertap.popupCallback received', data);
    });
  }, []);

  // --- WEB POP-UPS & EXIT INTENT ACTION HANDLERS ---

  function handleTriggerPopup(popupType, options = {}) {
    const campaignId = options.campaignId || `camp_${popupType}_${Date.now()}`;
    const pivotId = options.pivotId || `Variant_${popupType.toUpperCase()}_1`;
    const msgId = `${campaignId}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

    if (!dismissSpamControl && shownCampaignsInSession[campaignId]) {
      const msg = `Campaign "${campaignId}" blocked: dismissSpamControl is false (one-time delivery per session).`;
      showStatusToast(msg);
      addActivityLog('CLEVERTAP_POPUP', 'Popup Delivery Blocked (dismissSpamControl = false)', {
        campaignId,
        dismissSpamControl,
        rule: 'One-time delivery per session active'
      });
      setPopupAnalytics((prev) => ({ ...prev, spamBlockedCount: prev.spamBlockedCount + 1 }));
      return null;
    }

    const titles = {
      box: 'Level Up Your FocusFlow Experience',
      banner: '⚡ Focus Challenge: 3 Pomodoros Today',
      interstitial: '🎯 Deep Work Sprint: 50-Min Audio Immersion',
      imageOnly: 'FocusFlow Visual Masterclass Series',
      pip: 'Picture-in-Picture Video: Deep Work Tactics',
      customHtml: 'Custom HTML Pop-up (with wzrk_c2a)',
      customCallback: 'Custom Notification via clevertap.notificationCallback'
    };

    const descriptions = {
      box: 'Upgrade to FocusFlow Pro today to unlock binaural ambient tracks and unlimited session analytics.',
      banner: 'Complete 3 focus sessions before 6 PM to earn the Daily Flow Star on your profile!',
      interstitial: 'Block distracting tabs and activate flow state soundtracks for the next 50 minutes.',
      imageOnly: 'Explore our visual guide to structuring your work day for maximum creative output.',
      pip: 'Watch this 3-minute tactical walkthrough while continuing to manage your tasks below.',
      customHtml: 'Interactive HTML template featuring custom wzrk_c2a click tracking attributes.',
      customCallback: 'Application-rendered UI triggered by clevertap.notificationCallback.'
    };

    const newPopup = {
      id: popupType === 'box' ? 'wizParDiv0' : popupType === 'banner' ? 'wizParDiv2' : popupType === 'interstitial' ? 'intentPreview' : 'popupWrapper',
      type: popupType,
      campaignId,
      pivotId,
      msgId,
      title: options.title || titles[popupType] || 'FocusFlow Notification',
      description: options.description || descriptions[popupType] || 'Notice from CleverTap campaign engine',
      c2aText: options.c2aText || 'Learn More',
      secondaryText: options.secondaryText || 'Dismiss',
      kv: options.kv || { campaign_category: 'focus_promotion', source: 'web_popups_studio' },
      anchor: options.anchor || pipConfig.anchor,
      mediaUrl: options.mediaUrl || 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80',
      ...options
    };

    if (popupType === 'customCallback') {
      const callbackPayload = {
        msgContent: {
          html: `<div class="p-4 bg-white rounded-xl shadow-lg border border-indigo-100">
            <h4 class="font-bold text-slate-900">${newPopup.title}</h4>
            <p class="text-xs text-slate-600 mt-1">${newPopup.description}</p>
          </div>`,
          type: 1,
          templateType: 'banner',
          title: newPopup.title,
          description: newPopup.description,
          kv: newPopup.kv
        },
        msgId
      };
      setCustomNotificationMsg(callbackPayload);
      const ct = getCleverTapInstance();
      if (ct && typeof ct.notificationCallback === 'function') {
        ct.notificationCallback(callbackPayload);
      }
    }

    setActivePopup(newPopup);
    setShownCampaignsInSession((prev) => ({ ...prev, [campaignId]: true }));

    const viewedPayload = { msgId, pivotId };
    const viewedLog = renderCleverTapNotificationViewed(viewedPayload);
    addActivityLog('CLEVERTAP_POPUP', `clevertap.renderNotificationViewed (${popupType})`, viewedLog);

    setPopupAnalytics((prev) => ({ ...prev, viewedCount: prev.viewedCount + 1 }));
    showStatusToast(`Triggered CleverTap ${popupType.toUpperCase()} Pop-up`);
    return newPopup;
  }

  function handleCloseActivePopup(popupType = null) {
    const targetType = popupType || activePopup?.type || 'all';
    const closeResult = closeActiveCleverTapPopup(targetType);
    setActivePopup(null);
    setPopupAnalytics((prev) => ({ ...prev, dismissedCount: prev.dismissedCount + 1 }));
    addActivityLog('CLEVERTAP_POPUP', `Close Web Pop-up (${targetType})`, closeResult);
    showStatusToast(`Closed ${targetType} Pop-up`);
  }

  function handlePopupActionClicked(customPayload = null) {
    const payload = customPayload || {
      msgId: activePopup?.msgId || `camp_click_${Date.now()}`,
      pivotId: activePopup?.pivotId || 'Variant_Default',
      kv: activePopup?.kv || {}
    };

    if (activePopup?.type === 'customHtml') {
      const clickResult = raiseCleverTapPopupNotificationClicked(payload);
      addActivityLog('CLEVERTAP_POPUP', 'clevertap.raisePopupNotificationClicked', clickResult);
    } else {
      const clickResult = renderCleverTapNotificationClicked(payload);
      addActivityLog('CLEVERTAP_POPUP', 'clevertap.renderNotificationClicked', clickResult);
    }

    setPopupAnalytics((prev) => ({ ...prev, clickedCount: prev.clickedCount + 1 }));
    showStatusToast(`Recorded Pop-up Click: ${payload.msgId}`);
  }

  function handleToggleDismissSpamControl(newVal) {
    const val = Boolean(newVal);
    setDismissSpamControl(val);
    const result = updateCleverTapDismissSpamControl(val);
    addActivityLog('CLEVERTAP_SDK', `clevertap.dismissSpamControl = ${val}`, result);
    showStatusToast(`Dismiss Spam Control set to ${val}`);
  }

  function handleToggleExitIntent(newVal) {
    const val = Boolean(newVal);
    setExitIntentEnabled(val);
    addActivityLog('CLEVERTAP_POPUP', `Exit Intent Listener ${val ? 'Enabled' : 'Disabled'}`, {
      viewport: 'Desktop (>480px)',
      behavior: 'Triggers on mouseleave at top edge (clientY <= 10)'
    });
    showStatusToast(`Desktop Exit Intent: ${val ? 'Enabled' : 'Disabled'}`);
  }

  function handlePipAnchorChange(newAnchor) {
    setPipConfig((prev) => ({ ...prev, anchor: newAnchor }));
    if (activePopup?.type === 'pip') {
      setActivePopup((prev) => ({ ...prev, anchor: newAnchor }));
    }
    addActivityLog('CLEVERTAP_POPUP', `PIP Anchor Position changed: ${newAnchor}`, {
      anchor: newAnchor,
      allAnchors: PIP_ANCHOR_POSITIONS
    });
  }

  function handlePipControl(action) {
    if (action === 'play_pause') {
      setPipConfig((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      addActivityLog('CLEVERTAP_POPUP', 'PIP Control: Play/Pause toggled', { isPlaying: !pipConfig.isPlaying });
    } else if (action === 'mute_unmute') {
      setPipConfig((prev) => ({ ...prev, isMuted: !prev.isMuted }));
      addActivityLog('CLEVERTAP_POPUP', 'PIP Control: Mute/Unmute toggled', { isMuted: !pipConfig.isMuted });
    } else if (action === 'expand_collapse') {
      setPipConfig((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
      addActivityLog('CLEVERTAP_POPUP', 'PIP Control: Expand/Collapse toggled', { isExpanded: !pipConfig.isExpanded });
    } else if (action === 'open_tab') {
      window.open('https://focusflow.app', '_blank');
      handlePopupActionClicked();
    } else if (action === 'close') {
      handleCloseActivePopup('pip');
    }
  }

  function handleResetSessionCampaigns() {
    setShownCampaignsInSession({});
    showStatusToast('Reset session campaign history (Simulating new session)');
    addActivityLog('CLEVERTAP_POPUP', 'Session Campaign History Reset', {
      note: 'All campaigns can now be shown again even if dismissSpamControl = false'
    });
  }

  // --- WEB PUSH & VAPID ACTIONS ---

  function handleRequestSoftPrompt(opts = {}) {
    if (opts.reject) {
      recordPushRejection();
      setPushCooldownInfo(getPushRejectionCooldown(softPromptOptions.askAgainTimeInSeconds));
      addActivityLog('CLEVERTAP_WEBPUSH', 'User rejected Web Push soft prompt (cooldown active)', {
        askAgainTimeInSeconds: softPromptOptions.askAgainTimeInSeconds,
        policy: '1-week rejection frequency rule (or custom cooldown)'
      });
      showStatusToast('Soft prompt rejected (cooldown active)');
      return;
    }

    const res = requestCleverTapPushPermission({ ...softPromptOptions, ...opts });
    if (res.status === 'SUPPRESSED_COOLDOWN') {
      setPushCooldownInfo(res.cooldown);
      showStatusToast(`Prompt suppressed by 1-week rule (${res.cooldown.remainingSeconds}s left)`);
    } else {
      showStatusToast('Triggered clevertap.notifications.push()');
    }

    addActivityLog('CLEVERTAP_WEBPUSH', 'clevertap.notifications.push', res);
  }

  async function handleRequestNativePermission() {
    const res = await requestNativeBrowserPermission();
    setPushPermissionStatus(res);
    addActivityLog('CLEVERTAP_WEBPUSH', `Browser Notification.requestPermission() -> ${res}`, {
      permission: res,
      timestamp: new Date().toISOString()
    });
    showStatusToast(`Browser Push Permission: ${String(res).toUpperCase()}`);
  }

  function handleUpdateSoftPromptOptions(newOptions) {
    setSoftPromptOptions((prev) => ({ ...prev, ...newOptions }));
    showStatusToast('Soft prompt configuration applied');
    addActivityLog('CLEVERTAP_WEBPUSH', 'Updated Soft Prompt configuration', newOptions);
  }

  function handleResetPushCooldown() {
    clearPushRejectionCooldown();
    setPushCooldownInfo(getPushRejectionCooldown(softPromptOptions.askAgainTimeInSeconds));
    showStatusToast('Rejection cooldown cleared — prompt can be shown immediately');
    addActivityLog('CLEVERTAP_WEBPUSH', 'Push rejection cooldown cleared', {
      rule: 'Frequency restriction reset'
    });
  }

  async function handleFetchVapidKeys() {
    setIsLoadingVapid(true);
    try {
      const data = await fetchVapidKeysFromBackend(true);
      if (data?.keys) {
        setVapidKeys(data.keys);
      }
    } catch (err) {
      console.warn('[ViewModel] fetchVapidKeys error:', err);
    } finally {
      setIsLoadingVapid(false);
    }
  }

  async function handleGenerateVapidKeys() {
    setIsLoadingVapid(true);
    try {
      const data = await generateVapidKeysOnBackend();
      if (data?.keys) {
        setVapidKeys(data.keys);
        addActivityLog('CLEVERTAP_WEBPUSH', 'Generated fresh VAPID key pair (web-push)', {
          publicKey: data.keys.publicKey,
          generatedAt: data.keys.generatedAt
        });
        showStatusToast('Fresh VAPID keys generated successfully!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate VAPID keys');
    } finally {
      setIsLoadingVapid(false);
    }
  }

  function handleSimulateTokenMigration(scenario) {
    const result = evaluateTokenMigration(scenario);
    setMigrationResult(result);
    addActivityLog('CLEVERTAP_WEBPUSH', `Token Migration Evaluation (${scenario})`, result);
    showStatusToast(`Evaluated Token Migration: ${scenario}`);
  }

  async function handleSimulatePushNotification(params) {
    try {
      const res = await simulatePushNotificationOnBackend(params);
      setSimulatedPushResult(res);
      addActivityLog('CLEVERTAP_WEBPUSH', 'Simulated Web Push Notification Payload', res);
      showStatusToast('Push notification payload simulated!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to simulate push notification');
    }
  }

  // --- WEB NATIVE DISPLAY ACTIONS (CT_web_native_display) ---

  function handleTriggerNativeTopic(topicName) {
    const matchedCamp = nativeCampaignsList.find(
      (c) => c.topic === topicName && c.type === 'kv_pair'
    );
    let payload = matchedCamp?.payload ? JSON.parse(JSON.stringify(matchedCamp.payload)) : null;

    if (!payload) {
      if (topicName === 'Cart drop-off') {
        payload = {
          kv: {
            topic: 'Cart drop-off',
            Name: user.name || 'Elena Vance',
            Cart: 'Roadster Jacket',
            DiscountCode: 'SALE20',
            DiscountPercent: '20%',
            ExpiryHours: 24,
            BannerImage:
              'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
          },
          msgId: `1649748667_${Date.now()}_c1`,
          wzrk_pivot: 'wzrk_default'
        };
      } else if (topicName === 'Focus Streak Milestone') {
        payload = {
          kv: {
            topic: 'Focus Streak Milestone',
            Name: user.name || 'Elena Vance',
            StreakCount: dashboard.currentStreak || 7,
            MilestoneBadge: 'Golden Pomodoro Champion',
            CelebrationMessage: 'Unstoppable! 7 consecutive deep work days completed.'
          },
          msgId: `1649748667_${Date.now()}_c3`,
          wzrk_pivot: 'streak_v1'
        };
      } else {
        payload = {
          kv: {
            topic: 'Pro Upgrade Offer',
            Name: user.name || 'Elena Vance',
            PlanName: 'FocusFlow Annual Pro',
            OriginalPrice: '$59.99',
            OfferPrice: '$29.99',
            Perks: 'Binaural Soundscapes, Unlimited Analytics, Priority Sync'
          },
          msgId: `1649748667_${Date.now()}_c4`,
          wzrk_pivot: 'annual_pro_50off'
        };
      }
    }

    // Ensure topic is the first key in kv according to official CleverTap documentation
    if (payload?.kv) {
      const { topic, ...rest } = payload.kv;
      payload.kv = { topic: topic || topicName, ...rest };
    }

    // Dispatch event (triggers document listener)
    dispatchCleverTapNativeDisplayEvent(CT_NATIVE_EVENTS.KV_DISPLAY, payload);
    setNativeDisplayData(payload);
    setActiveNativeTopic(topicName);

    // Call topic renderer to track Notification Viewed
    if (topicName === 'Cart drop-off') {
      renderCartDropOffPersonalisationCampaign(payload);
    } else if (topicName === 'Focus Streak Milestone') {
      renderStreakPersonalisationCampaign(payload);
    } else if (topicName === 'Pro Upgrade Offer') {
      renderProOfferPersonalisationCampaign(payload);
    }

    addActivityLog(
      'CLEVERTAP_NATIVE',
      `document.dispatchEvent("CT_web_native_display") [Topic: "${topicName}"]`,
      payload
    );
    showStatusToast(`Personalized content rendered for topic: "${topicName}"`);
  }

  function handleResetNativeFallback() {
    setNativeDisplayData(null);
    setActiveNativeTopic(null);
    addActivityLog('CLEVERTAP_NATIVE', 'Reset to Default / Fallback Content', {
      fallbackActive: true,
      reason: 'Manual reset or fallback test'
    });
    showStatusToast('Reverted to Default / Fallback Content');
  }

  function handleNativeElementActionClicked(data) {
    const payload = data || nativeDisplayData;
    renderCleverTapNotificationClicked(payload);
    addActivityLog('CLEVERTAP_NATIVE', 'clevertap.renderNotificationClicked()', payload);
    showStatusToast('Notification Clicked tracked in CleverTap!');
  }

  async function handleResolveNativePriorities(customCampaigns) {
    setIsResolvingPriority(true);
    const campaignsToEvaluate = customCampaigns || nativeCampaignsList;
    try {
      // 1. Evaluate client-side according to official spec
      const clientResult = resolveNativeDisplayPriorities(campaignsToEvaluate);
      setPriorityResults(clientResult);

      // 2. Also verify against backend priority resolution engine
      try {
        const backendRes = await resolveNativeDisplayPrioritiesOnBackend(campaignsToEvaluate);
        if (backendRes?.data) {
          setPriorityResults(backendRes.data);
        }
      } catch (backendErr) {
        console.warn('[ViewModel] Backend priority resolution fallback to client:', backendErr);
      }

      addActivityLog('CLEVERTAP_NATIVE', 'Campaign Priority Resolution Engine Evaluated', clientResult);
      showStatusToast(
        `Priorities Resolved: ${clientResult.executedCount} winning, ${clientResult.suppressedCount} suppressed`
      );
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resolve campaign priorities');
    } finally {
      setIsResolvingPriority(false);
    }
  }

  // --- WEB INBOX (<ct-web-inbox>) ACTIONS ---

  // Toggles the Web Inbox window open/closed relative to #ct-inbox-bell-trigger
  function handleToggleInbox() {
    setIsInboxOpen((prev) => {
      const nextState = !prev;
      if (nextState && typeof window !== 'undefined') {
        const bellEl = window.document.getElementById('ct-inbox-bell-trigger');
        if (bellEl) {
          const rect = bellEl.getBoundingClientRect();
          const posStyle = calculateWebInboxPosition(rect, inboxPosition, {
            width: parseInt(inboxStyles.width, 10) || 392,
            height: parseInt(inboxStyles.height, 10) || 546
          });
          setInboxPositionStyle(posStyle);
        }
      }
      addActivityLog('CLEVERTAP_INBOX', `Web Inbox ${nextState ? 'OPENED' : 'CLOSED'}`, {
        isOpen: nextState,
        inboxPosition,
        unreadCount: inboxMessages.filter((m) => !m.isRead).length
      });
      return nextState;
    });
  }

  function handleCloseInbox() {
    setIsInboxOpen(false);
    addActivityLog('CLEVERTAP_INBOX', 'Web Inbox CLOSED (Outside click or close button)', {
      isOpen: false
    });
  }

  function handleSetInboxPosition(newPosition) {
    setInboxPosition(newPosition);
    if (typeof window !== 'undefined') {
      const bellEl = window.document.getElementById('ct-inbox-bell-trigger');
      if (bellEl) {
        const rect = bellEl.getBoundingClientRect();
        const posStyle = calculateWebInboxPosition(rect, newPosition, {
          width: parseInt(inboxStyles.width, 10) || 392,
          height: parseInt(inboxStyles.height, 10) || 546
        });
        setInboxPositionStyle(posStyle);
      }
    }
    showStatusToast(`Inbox position set to: ${newPosition}`);
    addActivityLog('CLEVERTAP_INBOX', `Updated Inbox Position Anchor -> ${newPosition}`, {
      position: newPosition
    });
  }

  function handleUpdateInboxStyles(styleUpdates) {
    setInboxStyles((prev) => {
      const updated = { ...prev, ...styleUpdates };
      if (typeof window !== 'undefined') {
        const bellEl = window.document.getElementById('ct-inbox-bell-trigger');
        if (bellEl) {
          const rect = bellEl.getBoundingClientRect();
          const posStyle = calculateWebInboxPosition(rect, inboxPosition, {
            width: parseInt(updated.width, 10) || 392,
            height: parseInt(updated.height, 10) || 546
          });
          setInboxPositionStyle(posStyle);
        }
      }
      return updated;
    });
    showStatusToast('Web Inbox styles updated');
    addActivityLog('CLEVERTAP_INBOX', 'Updated Web Inbox CSS Properties', styleUpdates);
  }

  // Marks a single message as read
  async function handleMarkInboxMessageRead(msgId) {
    markReadCleverTapInboxMessage(msgId);
    setInboxMessages((prev) =>
      prev.map((m) => (m.msgId === msgId || m.id === msgId ? { ...m, isRead: true } : m))
    );
    try {
      await markInboxMessageReadOnBackend(msgId, user.id);
    } catch (err) {
      console.warn('[ViewModel] markInboxMessageRead error:', err);
    }
    addActivityLog('CLEVERTAP_INBOX', `clevertap.markReadInboxMessage("${msgId}")`, { msgId });
  }

  // Marks all messages as read
  async function handleMarkAllInboxMessagesRead() {
    markReadAllCleverTapInboxMessages();
    setInboxMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    try {
      await markAllInboxMessagesReadOnBackend(user.id);
    } catch (err) {
      console.warn('[ViewModel] markAllInboxMessagesRead error:', err);
    }
    showStatusToast('All inbox messages marked as read');
    addActivityLog('CLEVERTAP_INBOX', 'clevertap.markReadAllInboxMessage()', { markedAll: true });
  }

  // Deletes a single message
  async function handleDeleteInboxMessage(msgId) {
    deleteCleverTapInboxMessage(msgId);
    setInboxMessages((prev) => prev.filter((m) => m.msgId !== msgId && m.id !== msgId));
    try {
      await deleteInboxMessageOnBackend(msgId, user.id);
    } catch (err) {
      console.warn('[ViewModel] deleteInboxMessage error:', err);
    }
    showStatusToast('Notification deleted from Web Inbox');
    addActivityLog('CLEVERTAP_INBOX', `clevertap.deleteInboxMessage("${msgId}")`, { msgId });
  }

  // Tracks Notification Viewed (raised only ONCE per message according to CleverTap spec)
  function handleInboxNotificationViewed(messageData) {
    const result = renderCleverTapInboxNotificationViewed(messageData);
    if (result.status === 'VIEWED_RECORDED') {
      addActivityLog('CLEVERTAP_INBOX', 'clevertap.renderNotificationViewed() [Inbox Message]', result);
    }
  }

  // Tracks Notification Clicked (raised each time the user clicks on the message)
  function handleInboxNotificationClicked(messageData) {
    const result = renderCleverTapInboxNotificationClicked(messageData);
    setInboxMessages((prev) =>
      prev.map((m) =>
        m.msgId === messageData.msgId || m.id === messageData.id ? { ...m, isRead: true } : m
      )
    );
    markInboxMessageReadOnBackend(messageData.msgId || messageData.id, user.id).catch(() => {});
    addActivityLog('CLEVERTAP_INBOX', 'clevertap.renderNotificationClicked() [Inbox Message]', result);
    showStatusToast(`Notification Clicked tracked for "${messageData.title}"`);
  }

  // Simulates an incoming Web Inbox notification
  async function handleSimulateIncomingInboxMessage(payload) {
    try {
      const response = await simulateIncomingInboxNotificationOnBackend({
        ...payload,
        userId: user.id
      });
      if (response?.data) {
        setInboxMessages((prev) => [response.data, ...prev]);
        setCleverTapInboxMessages([response.data, ...inboxMessages]);
        addActivityLog('CLEVERTAP_INBOX', 'Injected Simulated Web Inbox Notification', response.data);
        showStatusToast(`New Web Inbox message received: "${response.data.title}"`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to simulate incoming inbox notification');
    }
  }

  // Runs a live test of one of the 10 official JavaScript APIs
  function handleRunInboxApiTest(apiName) {
    let result = null;
    const firstMsg = inboxMessages[0];
    const firstId = firstMsg?.msgId || firstMsg?.id || 'inbox_msg_001';

    switch (apiName) {
      case 'getInboxMessageCount':
        result = { method: 'clevertap.getInboxMessageCount()', count: getCleverTapInboxMessageCount() };
        break;
      case 'getInboxMessageUnreadCount':
        result = {
          method: 'clevertap.getInboxMessageUnreadCount()',
          unreadCount: getCleverTapInboxMessageUnreadCount()
        };
        break;
      case 'getAllInboxMessages':
        result = { method: 'clevertap.getAllInboxMessages()', messages: getAllCleverTapInboxMessages() };
        break;
      case 'getUnreadInboxMessages':
        result = {
          method: 'clevertap.getUnreadInboxMessages()',
          unreadMessages: getUnreadCleverTapInboxMessages()
        };
        break;
      case 'getInboxMessageForId':
        result = {
          method: `clevertap.getInboxMessageForId("${firstId}")`,
          message: getCleverTapInboxMessageForId(firstId)
        };
        break;
      case 'markReadInboxMessage':
        handleMarkInboxMessageRead(firstId);
        result = { method: `clevertap.markReadInboxMessage("${firstId}")`, success: true };
        break;
      case 'markReadAllInboxMessage':
        handleMarkAllInboxMessagesRead();
        result = { method: 'clevertap.markReadAllInboxMessage()', success: true };
        break;
      case 'deleteInboxMessage':
        handleDeleteInboxMessage(firstId);
        result = { method: `clevertap.deleteInboxMessage("${firstId}")`, success: true };
        break;
      case 'renderNotificationViewed':
        result = renderCleverTapInboxNotificationViewed(
          firstMsg || { msgId: 'inbox_msg_001', wzrk_pivot: 'pivot_demo' }
        );
        break;
      case 'renderNotificationClicked':
        result = renderCleverTapInboxNotificationClicked(
          firstMsg || { msgId: 'inbox_msg_001', wzrk_pivot: 'pivot_demo' }
        );
        break;
      default:
        result = { status: 'UNKNOWN_API' };
        break;
    }

    setInboxApiTestResult(result);
    addActivityLog('CLEVERTAP_INBOX', `API Tested: ${apiName}`, result);
    showStatusToast(`Executed ${apiName}()`);
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
    handleClearActivityLogs,

    // Web Pop-ups & Exit Intent state & handlers
    activePopup,
    dismissSpamControl,
    exitIntentEnabled,
    pipConfig,
    customNotificationMsg,
    popupAnalytics,
    shownCampaignsInSession,
    handleTriggerPopup,
    handleCloseActivePopup,
    handlePopupActionClicked,
    handleToggleDismissSpamControl,
    handleToggleExitIntent,
    handlePipAnchorChange,
    handlePipControl,
    handleResetSessionCampaigns,

    // Web Push & VAPID Protocol state & handlers
    pushPermissionStatus,
    sdkVersionInfo,
    browserPushSupport,
    vapidKeys,
    isLoadingVapid,
    pushCooldownInfo,
    softPromptOptions,
    migrationResult,
    simulatedPushResult,
    handleRequestSoftPrompt,
    handleRequestNativePermission,
    handleUpdateSoftPromptOptions,
    handleResetPushCooldown,
    handleFetchVapidKeys,
    handleGenerateVapidKeys,
    handleSimulateTokenMigration,
    handleSimulatePushNotification,

    // Web Native Display state & handlers
    nativeDisplayData,
    activeNativeTopic,
    nativeCampaignsList,
    priorityResults,
    isResolvingPriority,
    handleTriggerNativeTopic,
    handleResetNativeFallback,
    handleNativeElementActionClicked,
    handleResolveNativePriorities,

    // Web Inbox (<ct-web-inbox>) state & handlers
    isInboxOpen,
    inboxMessages,
    inboxUnreadCount: inboxMessages.filter((m) => !m.isRead).length,
    inboxPosition,
    inboxStyles,
    inboxPositionStyle,
    inboxApiTestResult,
    handleToggleInbox,
    handleCloseInbox,
    handleSetInboxPosition,
    handleUpdateInboxStyles,
    handleMarkInboxMessageRead,
    handleMarkAllInboxMessagesRead,
    handleDeleteInboxMessage,
    handleInboxNotificationViewed,
    handleInboxNotificationClicked,
    handleSimulateIncomingInboxMessage,
    handleRunInboxApiTest
  };
}
