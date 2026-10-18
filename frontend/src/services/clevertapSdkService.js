// ============================================================================
// FILE: frontend/src/services/clevertapSdkService.js
// PURPOSE: Full CleverTap Web SDK integration adapted from focusflow_int/web/
// and the Web SDK Quick Start Guide, Web User Profiles, and Web User Events guides.
// Supports: init, account token, region (eu1), spa, onUserLogin, profile.push,
// event.push, Charged special event, getLocation, handleIncrement/DecrementValue,
// setLogLevel, sessionStorage['WZRK_D'], and setOffline.
// ============================================================================

// Canonical event names adapted from integrations/focusflow_int/web/events.ts
export const CLEVERTAP_EVENTS = {
  APP_LAUNCHED: 'App Launched',
  USER_REGISTERED: 'User Registered',
  USER_LOGGED_IN: 'User Logged In',
  USER_LOGGED_OUT: 'User Logged Out',
  DASHBOARD_VIEWED: 'Dashboard Viewed',
  PROGRESS_VIEWED: 'Progress Viewed',
  PROFILE_VIEWED: 'Profile Viewed',
  SETTINGS_UPDATED: 'Settings Updated',
  TASK_CREATED: 'Task Created',
  TASK_COMPLETED: 'Task Completed',
  TASK_DELETED: 'Task Deleted',
  FOCUS_SESSION_STARTED: 'Focus Session Started',
  FOCUS_SESSION_COMPLETED: 'Focus Session Completed',
  FOCUS_SESSION_ABANDONED: 'Focus Session Abandoned',
  CHARGED: 'Charged',
  LOCATION_UPDATED: 'Location Updated',
  CONSENT_UPDATED: 'Consent Updated'
};

// Default SDK credentials provided by user (Account ID: 587-878-Z97Z, Token: bab-ab5, Region: eu1)
export const defaultCleverTapConfig = {
  accountId: process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID || '587-878-Z97Z',
  token: process.env.NEXT_PUBLIC_CLEVERTAP_TOKEN || 'bab-ab5',
  region: process.env.NEXT_PUBLIC_CLEVERTAP_REGION || 'eu1',
  targetDomain: process.env.NEXT_PUBLIC_CLEVERTAP_TARGET_DOMAIN || '',
  logLevel: 3, // 0: off, 1: errors, 2: info + errors, 3: all logs
  spa: true,
  dismissSpamControl: true, // Web SDK v2.0+ default: true. Set false to restrict repeat notifications per session.
  optOut: false,
  useIP: false,
  isOffline: false,
  wzrkDebug: true
};

// Safely loads the clevertap-web-sdk package in the browser (avoids Next.js SSR crashes)
export function getCleverTapInstance() {
  if (typeof window === 'undefined') return null;

  if (window.__clevertapSdkModule) return window.__clevertapSdkModule;
  if (window.clevertap) {
    window.__clevertapSdkModule = window.clevertap;
    return window.clevertap;
  }

  try {
    if (typeof require === 'function') {
      const sdkModule = require('clevertap-web-sdk');
      const clevertap = sdkModule.default || sdkModule;
      window.__clevertapSdkModule = clevertap;
      window.clevertap = clevertap;
      return clevertap;
    }
  } catch {
    // Graceful fallback if require is not available or module resolution fails
  }

  return window.clevertap || null;
}

// 1. INITIALIZE SDK (clevertap.init + spa + dismissSpamControl + privacy + setLogLevel)
export function initializeCleverTapSdk(customConfig = {}) {
  const clevertap = getCleverTapInstance();
  const config = { ...defaultCleverTapConfig, ...customConfig };

  if (!clevertap) {
    return { status: 'SSR_SKIPPED', config };
  }

  try {
    // Enable Single Page Application (SPA) mode
    clevertap.spa = Boolean(config.spa);

    // Set Dismiss Spam Control flag (default true in Web SDK v2.0+)
    try {
      clevertap.dismissSpamControl = Boolean(config.dismissSpamControl ?? true);
    } catch {
      // Safe fallback if property is read-only
    }

    // Push initial privacy flags
    clevertap.privacy.push({ optOut: Boolean(config.optOut) });
    clevertap.privacy.push({ useIP: Boolean(config.useIP) });

    const targetDomainParam =
      config.targetDomain && config.targetDomain.trim() !== ''
        ? config.targetDomain.trim()
        : undefined;
    const tokenParam =
      config.token && config.token.trim() !== '' ? config.token.trim() : undefined;

    // Initialize with Account ID, Region, Target Domain, and Project Token
    // SDK init signature: init(accountId, region, targetDomain, token)
    clevertap.init(config.accountId, config.region, targetDomainParam, tokenParam);

    // If legacy array-based clevertap.account exists (HTML script snippet), push to it safely
    if (Array.isArray(clevertap.account)) {
      clevertap.account.push(
        { id: config.accountId, token: config.token },
        config.region,
        targetDomainParam
      );
    }

    // Do not enable enableFetchApi as CleverTap endpoint returns script ($WZRK_WR), which crashes JSON.parse in handleFetchResponse

    // Set SDK console log level (0 = off, 1 = errors, 2 = info, 3 = all logs)
    if (typeof clevertap.setLogLevel === 'function') {
      clevertap.setLogLevel(Number(config.logLevel ?? 3));
    }

    // Enable verbose browser console debugging
    if (config.wzrkDebug && typeof window !== 'undefined') {
      window.sessionStorage['WZRK_D'] = '';
    } else if (typeof window !== 'undefined') {
      delete window.sessionStorage['WZRK_D'];
    }

    console.log(
      `[CleverTap Web SDK] Initialized with Account ID: ${config.accountId}, Region: ${config.region}, Token: ${config.token}`
    );

    return {
      method: 'clevertap.init(accountId, region, targetDomain, token)',
      accountId: config.accountId,
      token: config.token || '(not set)',
      region: config.region,
      targetDomain: config.targetDomain || 'clevertap-prod.com (default)',
      spa: clevertap.spa,
      dismissSpamControl: Boolean(clevertap.dismissSpamControl ?? config.dismissSpamControl ?? true),
      logLevel: Number(config.logLevel ?? 3),
      wzrkDebug: Boolean(config.wzrkDebug),
      privacy: { optOut: Boolean(config.optOut), useIP: Boolean(config.useIP) }
    };
  } catch (error) {
    console.warn('[CleverTap Web SDK] Initialization warning:', error);
    return { method: 'clevertap.init', error: error.message };
  }
}

// Helper to safely format Date values into ISO string without crashing if mutated
function toSafeIsoString(val, fallback = '1998-05-14T00:00:00.000Z') {
  if (!val) return fallback;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? fallback : val.toISOString();
  }
  if (typeof val === 'string') {
    if (val.startsWith('$D_')) {
      const sec = parseInt(val.replace('$D_', ''), 10);
      return !isNaN(sec) ? new Date(sec * 1000).toISOString() : val;
    }
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? val : parsed.toISOString();
  }
  if (typeof val === 'number') {
    return new Date(val).toISOString();
  }
  return String(val);
}

// 2. IDENTIFY USER ON LOGIN / REGISTER (clevertap.onUserLogin.push)
export function sendCleverTapUserLogin(user, dashboardStats = {}) {
  const clevertap = getCleverTapInstance();

  const rawDob = user.dob ? new Date(user.dob) : new Date('1998-05-14');
  const validDob = rawDob instanceof Date && !isNaN(rawDob.getTime()) ? rawDob : new Date('1998-05-14');
  const dobIso = validDob.toISOString();

  const userEmail = (user.email || 'elena.vance@focusflow.app').trim().toLowerCase();
  const userName = user.name || 'Elena Vance';
  const userId = user.id || 'usr_elena_vance';

  const sitePayload = {
    Site: {
      Name: userName,
      // Setting Identity to userEmail ensures Find People in CleverTap finds Elena whether searching by Email or Identity
      Identity: userEmail,
      'User ID': String(userId),
      Email: userEmail,
      Phone: user.phone || '+14155552671',
      Gender: user.gender || 'F',
      DOB: validDob,
      Occupation: user.occupation || 'Senior Product Designer',
      'Focus Goal': user.focusGoal || 'Deep Work',
      'Customer Type': user.isPro ? 'Pro Member' : 'Standard Member',
      'Total Focus Minutes': dashboardStats.totalFocusMinutes ?? 0,
      'Total Sessions Completed': dashboardStats.totalFocusSessionsCompleted ?? 0,
      'Total Tasks Completed': dashboardStats.totalTasksCompleted ?? 0,
      'Current Streak': dashboardStats.currentStreak ?? 0,
      'MSG-email': Boolean(user.preferences?.marketingConsent ?? true),
      'MSG-push': Boolean(user.preferences?.notificationsEnabled ?? true),
      'MSG-sms': true,
      'MSG-whatsapp': true,
      'category-resubscribe': { email: ['Productivity Tips', 'Weekly Digest'] },
      'category-unsubscribe': { email: ['Promotions'] }
    }
  };

  if (clevertap) {
    try {
      // Pass a clone of Site with fresh Date instances because CleverTap SDK mutates the object in place
      clevertap.onUserLogin.push({
        Site: {
          ...sitePayload.Site,
          DOB: new Date(validDob.getTime())
        }
      });
      console.log('[CleverTap Web SDK] onUserLogin successfully pushed for:', userEmail);
    } catch (error) {
      console.warn('[CleverTap Web SDK] onUserLogin error:', error);
    }
  }

  return {
    method: 'clevertap.onUserLogin.push',
    payload: {
      Site: {
        ...sitePayload.Site,
        DOB: dobIso
      }
    }
  };
}

// 3. UPDATE USER PROFILE ATTRIBUTES (clevertap.profile.push)
export function sendCleverTapProfileUpdate(user, dashboardStats = {}) {
  const clevertap = getCleverTapInstance();

  const rawDob = user.dob ? new Date(user.dob) : new Date('1998-05-14');
  const validDob = rawDob instanceof Date && !isNaN(rawDob.getTime()) ? rawDob : new Date('1998-05-14');
  const dobIso = validDob.toISOString();
  const lastActiveDate = new Date();
  const lastActiveIso = lastActiveDate.toISOString();

  const userEmail = (user.email || 'elena.vance@focusflow.app').trim().toLowerCase();
  const userName = user.name || 'Elena Vance';
  const userId = user.id || 'usr_elena_vance';

  const sitePayload = {
    Site: {
      Name: userName,
      Identity: userEmail,
      'User ID': String(userId),
      Email: userEmail,
      Phone: user.phone || '+14155552671',
      DOB: validDob,
      Occupation: user.occupation || 'Senior Product Designer',
      'Focus Goal': user.focusGoal || 'Deep Work',
      'Customer Type': user.isPro ? 'Pro Member' : 'Standard Member',
      'Notifications Enabled': Boolean(user.preferences?.notificationsEnabled ?? true),
      'Productivity Reminders': Boolean(user.preferences?.productivityReminders ?? true),
      'Session Reminders': Boolean(user.preferences?.sessionReminders ?? true),
      'Weekly Summary': Boolean(user.preferences?.weeklySummary ?? true),
      'Total Focus Minutes': dashboardStats.totalFocusMinutes ?? 0,
      'Total Sessions Completed': dashboardStats.totalFocusSessionsCompleted ?? 0,
      'Total Tasks Completed': dashboardStats.totalTasksCompleted ?? 0,
      'Current Streak': dashboardStats.currentStreak ?? 0,
      'MSG-email': Boolean(user.preferences?.marketingConsent ?? true),
      'MSG-push': Boolean(user.preferences?.notificationsEnabled ?? true),
      'Last Active Date': lastActiveDate
    }
  };

  if (clevertap) {
    try {
      // Pass a clone of Site with fresh Date instances because CleverTap SDK mutates the object in place
      clevertap.profile.push({
        Site: {
          ...sitePayload.Site,
          DOB: new Date(validDob.getTime()),
          'Last Active Date': new Date(lastActiveDate.getTime())
        }
      });
      console.log('[CleverTap Web SDK] profile.push successfully pushed for:', userEmail);
    } catch (error) {
      console.warn('[CleverTap Web SDK] profile.push error:', error);
    }
  }

  return {
    method: 'clevertap.profile.push',
    payload: {
      Site: {
        ...sitePayload.Site,
        DOB: dobIso,
        'Last Active Date': lastActiveIso
      }
    }
  };
}

// 4. SET USER LOCATION (clevertap.getLocation(lat, lng))
export function sendCleverTapLocation(lat = null, lng = null) {
  const clevertap = getCleverTapInstance();
  let result = {};

  if (clevertap && typeof clevertap.getLocation === 'function') {
    try {
      if (lat !== null && lng !== null) {
        clevertap.getLocation(Number(lat), Number(lng));
        result = { mode: 'manual', latitude: Number(lat), longitude: Number(lng) };
      } else {
        clevertap.getLocation();
        result = { mode: 'auto-geolocation' };
      }
    } catch (error) {
      console.warn('[CleverTap Web SDK] getLocation error:', error);
      result = { error: error.message };
    }
  }

  return {
    method: lat !== null ? `clevertap.getLocation(${lat}, ${lng})` : 'clevertap.getLocation()',
    details: result
  };
}

// 5. INCREMENT / DECREMENT NUMERIC PROFILE PROPERTIES
export function incrementCleverTapProfileProperty(propName, propValue = 1) {
  const clevertap = getCleverTapInstance();
  const numericValue = Number(propValue) || 1;

  if (clevertap && typeof clevertap.handleIncrementValue === 'function') {
    try {
      clevertap.handleIncrementValue(propName, numericValue);
    } catch (error) {
      console.warn('[CleverTap Web SDK] handleIncrementValue error:', error);
    }
  }

  return {
    method: `clevertap.handleIncrementValue("${propName}", ${numericValue})`,
    property: propName,
    incrementBy: numericValue
  };
}

export function decrementCleverTapProfileProperty(propName, propValue = 1) {
  const clevertap = getCleverTapInstance();
  const numericValue = Number(propValue) || 1;

  if (clevertap && typeof clevertap.handleDecrementValue === 'function') {
    try {
      clevertap.handleDecrementValue(propName, numericValue);
    } catch (error) {
      console.warn('[CleverTap Web SDK] handleDecrementValue error:', error);
    }
  }

  return {
    method: `clevertap.handleDecrementValue("${propName}", ${numericValue})`,
    property: propName,
    decrementBy: numericValue
  };
}

// 6. TRACK CUSTOM USER EVENTS (clevertap.event.push)
export function sendCleverTapEvent(eventName, eventProperties = null) {
  const clevertap = getCleverTapInstance();
  const hasProperties =
    eventProperties &&
    typeof eventProperties === 'object' &&
    Object.keys(eventProperties).length > 0;

  if (clevertap) {
    try {
      if (hasProperties) {
        clevertap.event.push(eventName, eventProperties);
      } else {
        clevertap.event.push(eventName);
      }
    } catch (error) {
      console.warn(`[CleverTap Web SDK] event.push("${eventName}") error:`, error);
    }
  }

  return {
    method: hasProperties
      ? `clevertap.event.push("${eventName}", properties)`
      : `clevertap.event.push("${eventName}")`,
    eventName,
    eventProperties: hasProperties ? eventProperties : '(no properties)'
  };
}

// 7. RECORD PURCHASES VIA "CHARGED" SPECIAL EVENT (clevertap.event.push("Charged", ...))
export function sendCleverTapChargedEvent(chargeData) {
  const clevertap = getCleverTapInstance();

  const chargedPayload = {
    Amount: Number(chargeData.amount) || 29.99,
    'Payment mode': chargeData.paymentMode || 'Credit Card',
    'Charged ID': chargeData.chargedId || `CHG_${Date.now()}`,
    Items: chargeData.items || [
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
  };

  if (clevertap) {
    try {
      clevertap.event.push('Charged', chargedPayload);
    } catch (error) {
      console.warn('[CleverTap Web SDK] Charged event error:', error);
    }
  }

  return {
    method: 'clevertap.event.push("Charged", payload)',
    payload: chargedPayload
  };
}

// 8. PRIVACY & DATA CONSENT (clevertap.privacy.push)
export function sendCleverTapPrivacyUpdate(optOutBoolean, useIpBoolean = false) {
  const clevertap = getCleverTapInstance();

  if (clevertap) {
    try {
      clevertap.privacy.push({ optOut: Boolean(optOutBoolean) });
      clevertap.privacy.push({ useIP: Boolean(useIpBoolean) });
    } catch (error) {
      console.warn('[CleverTap Web SDK] privacy.push error:', error);
    }
  }

  return {
    method: 'clevertap.privacy.push',
    payload: {
      optOut: Boolean(optOutBoolean),
      useIP: Boolean(useIpBoolean)
    }
  };
}

// 9. DEBUGGING LOG LEVEL & WZRK_D
export function updateCleverTapDebugSettings(logLevel = 3, enableWzrkDebug = true) {
  const clevertap = getCleverTapInstance();
  const numericLevel = Number(logLevel);

  if (clevertap && typeof clevertap.setLogLevel === 'function') {
    try {
      clevertap.setLogLevel(numericLevel);
    } catch (error) {
      console.warn('[CleverTap Web SDK] setLogLevel error:', error);
    }
  }

  if (typeof window !== 'undefined') {
    if (enableWzrkDebug) {
      window.sessionStorage['WZRK_D'] = '';
    } else {
      delete window.sessionStorage['WZRK_D'];
    }
  }

  return {
    method: `clevertap.setLogLevel(${numericLevel})`,
    logLevel: numericLevel,
    sessionStorage_WZRK_D: enableWzrkDebug ? "'' (enabled)" : 'disabled'
  };
}

// 10. OFFLINE MODE (clevertap.setOffline)
export function updateCleverTapOfflineMode(isOfflineBoolean) {
  const clevertap = getCleverTapInstance();
  const offlineState = Boolean(isOfflineBoolean);

  if (clevertap && typeof clevertap.setOffline === 'function') {
    try {
      clevertap.setOffline(offlineState);
    } catch (error) {
      console.warn('[CleverTap Web SDK] setOffline error:', error);
    }
  }

  return {
    method: `clevertap.setOffline(${offlineState})`,
    isOffline: offlineState,
    behavior: offlineState
      ? 'SDK is OFFLINE — events are queued locally in browser storage'
      : 'SDK is ONLINE — queued events flushed immediately to CleverTap server'
  };
}

// ============================================================================
// WEB POP-UPS & EXIT INTENT (CleverTap Web Pop-ups & Exit Intent Guide)
// ============================================================================

// 11. DISMISS SPAM CONTROL (clevertap.dismissSpamControl)
// When dismissSpamControl = false:
//   A campaign shown once will NOT be shown again until a new session begins.
// When dismissSpamControl = true (SDK v2.0+ default):
//   Overrides restriction; campaign can show repeatedly within the same session.
export function updateCleverTapDismissSpamControl(enabledBoolean) {
  const clevertap = getCleverTapInstance();
  const flag = Boolean(enabledBoolean);

  if (clevertap) {
    try {
      clevertap.dismissSpamControl = flag;
    } catch (error) {
      console.warn('[CleverTap Web SDK] dismissSpamControl set error:', error);
    }
  }

  return {
    method: `clevertap.dismissSpamControl = ${flag}`,
    dismissSpamControl: flag,
    behavior: flag
      ? 'Campaigns can repeat within the same session after being dismissed'
      : 'Campaigns will NOT repeat within the same session once dismissed (one-time delivery per session)'
  };
}

// 12. CLOSE BUTTON HELPERS (Matching official CleverTap DOM identifiers)
// Box Pop-up: #wizParDiv0
export function closeCleverTapBoxPopup() {
  if (typeof window === 'undefined') return { status: 'SSR_SKIPPED' };
  const wrapper = window.document.getElementById('wizParDiv0');
  if (wrapper) {
    setTimeout(() => {
      wrapper.remove();
    }, 0);
    return { method: 'closeBoxPopUp()', elementId: 'wizParDiv0', removed: true };
  }
  return { method: 'closeBoxPopUp()', elementId: 'wizParDiv0', removed: false, reason: 'Element not found in DOM' };
}

// Banner Pop-up: #wizParDiv2
export function closeCleverTapBannerPopup() {
  if (typeof window === 'undefined') return { status: 'SSR_SKIPPED' };
  const wrapper = window.document.getElementById('wizParDiv2');
  if (wrapper) {
    setTimeout(() => {
      wrapper.remove();
    }, 0);
    return { method: 'closeBannerPopUp()', elementId: 'wizParDiv2', removed: true };
  }
  return { method: 'closeBannerPopUp()', elementId: 'wizParDiv2', removed: false, reason: 'Element not found in DOM' };
}

// Interstitial Pop-up: #intentOpacityDiv (overlay) + #intentPreview (wrapper)
export function closeCleverTapInterstitialPopup() {
  if (typeof window === 'undefined') return { status: 'SSR_SKIPPED' };
  const overlay = window.document.getElementById('intentOpacityDiv');
  const wrapper = window.document.getElementById('intentPreview');
  setTimeout(() => {
    if (overlay) overlay.remove();
    if (wrapper) wrapper.remove();
  }, 0);
  return {
    method: 'closeInterstitialPopUp()',
    overlayId: 'intentOpacityDiv',
    wrapperId: 'intentPreview',
    removed: Boolean(overlay || wrapper)
  };
}

// Image-Only Pop-up: #wzrkImageOnlyDiv
export function closeCleverTapImageOnlyPopup() {
  if (typeof window === 'undefined') return { status: 'SSR_SKIPPED' };
  const wrapper = window.document.getElementById('wzrkImageOnlyDiv');
  if (wrapper) {
    setTimeout(() => {
      wrapper.remove();
    }, 0);
    return { method: 'closeImageOnlyPopUp()', elementId: 'wzrkImageOnlyDiv', removed: true };
  }
  return { method: 'closeImageOnlyPopUp()', elementId: 'wzrkImageOnlyDiv', removed: false };
}

// PIP Pop-up: <ct-web-popup-pip> or #ct-web-popup-pip
export function closeCleverTapPipPopup() {
  if (typeof window === 'undefined') return { status: 'SSR_SKIPPED' };
  const pipEl = window.document.querySelector('ct-web-popup-pip') || window.document.getElementById('ct-web-popup-pip');
  if (pipEl) {
    setTimeout(() => {
      pipEl.remove();
    }, 0);
    return { method: 'closePipPopUp()', element: '<ct-web-popup-pip>', removed: true };
  }
  return { method: 'closePipPopUp()', element: '<ct-web-popup-pip>', removed: false };
}

// Generic close function for active popups
export function closeActiveCleverTapPopup(templateType = 'all') {
  if (typeof window === 'undefined') return { status: 'SSR_SKIPPED' };
  const results = {};
  if (templateType === 'box' || templateType === 'all') {
    results.box = closeCleverTapBoxPopup();
  }
  if (templateType === 'banner' || templateType === 'all') {
    results.banner = closeCleverTapBannerPopup();
  }
  if (templateType === 'interstitial' || templateType === 'all') {
    results.interstitial = closeCleverTapInterstitialPopup();
  }
  if (templateType === 'imageOnly' || templateType === 'all') {
    results.imageOnly = closeCleverTapImageOnlyPopup();
  }
  if (templateType === 'pip' || templateType === 'all') {
    results.pip = closeCleverTapPipPopup();
  }
  return results;
}

// 13. SINGLE-PAGE APPLICATIONS (SPA) ROUTE CHANGE DISMISSAL
// When clevertap.spa is true, active Web popups (Box, Banner, Image Only) are automatically dismissed on route changes.
export function handleSpaRoutePopupDismissal() {
  if (typeof window === 'undefined') return { status: 'SSR_SKIPPED' };
  const clevertap = getCleverTapInstance();
  if (clevertap && clevertap.spa) {
    const box = closeCleverTapBoxPopup();
    const banner = closeCleverTapBannerPopup();
    const imageOnly = closeCleverTapImageOnlyPopup();
    return {
      spaMode: true,
      dismissed: {
        box: box.removed,
        banner: banner.removed,
        imageOnly: imageOnly.removed
      }
    };
  }
  return { spaMode: false, dismissed: null };
}

// 14. CUSTOM NOTIFICATION CALLBACK & RENDER TRACKING
// clevertap.notificationCallback = function(msg) { ... }
// clevertap.renderNotificationViewed(customNotificationPayload);
// clevertap.renderNotificationClicked(customNotificationPayload);
export function registerCleverTapNotificationCallback(customHandler) {
  const clevertap = getCleverTapInstance();
  if (clevertap) {
    clevertap.notificationCallback = function (msg) {
      console.log('[CleverTap Web SDK] Custom notificationCallback triggered with msg:', msg);
      if (typeof customHandler === 'function') {
        customHandler(msg);
      }
    };
    return {
      method: 'clevertap.notificationCallback = function(msg){...}',
      registered: true
    };
  }
  return { method: 'clevertap.notificationCallback', registered: false };
}

export function renderCleverTapNotificationViewed(customNotificationPayload = {}) {
  const clevertap = getCleverTapInstance();
  const payload = {
    msgId: customNotificationPayload?.msgId || `camp_${Date.now()}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    ...(customNotificationPayload?.pivotId ? { pivotId: customNotificationPayload.pivotId } : {})
  };

  if (clevertap && typeof clevertap.renderNotificationViewed === 'function') {
    try {
      clevertap.renderNotificationViewed(payload);
      console.log('[CleverTap Web SDK] renderNotificationViewed invoked:', payload);
    } catch (error) {
      console.warn('[CleverTap Web SDK] renderNotificationViewed error:', error);
    }
  }

  return {
    method: 'clevertap.renderNotificationViewed(payload)',
    payload
  };
}

export function renderCleverTapNotificationClicked(customNotificationPayload = {}) {
  const clevertap = getCleverTapInstance();
  const payload = {
    msgId: customNotificationPayload?.msgId || `camp_${Date.now()}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
    ...(customNotificationPayload?.pivotId ? { pivotId: customNotificationPayload.pivotId } : {}),
    ...(customNotificationPayload?.kv ? { kv: customNotificationPayload.kv } : {})
  };

  if (clevertap && typeof clevertap.renderNotificationClicked === 'function') {
    try {
      clevertap.renderNotificationClicked(payload);
      console.log('[CleverTap Web SDK] renderNotificationClicked invoked:', payload);
    } catch (error) {
      console.warn('[CleverTap Web SDK] renderNotificationClicked error:', error);
    }
  }

  return {
    method: 'clevertap.renderNotificationClicked(payload)',
    payload
  };
}

// 15. CUSTOM HTML POP-UP POPUPCALLBACK & CLICK TRACKING
// window.parent.clevertap.popupCallback = (notificationData) => { notificationObj = notificationData; }
// window.parent.clevertap.raisePopupNotificationClicked(notificationObj)
export function registerCleverTapPopupCallback(customHandler) {
  const clevertap = getCleverTapInstance();
  if (clevertap) {
    clevertap.popupCallback = function (notificationData) {
      console.log('[CleverTap Web SDK] Custom popupCallback received notificationData:', notificationData);
      if (typeof customHandler === 'function') {
        customHandler(notificationData);
      }
    };
    return {
      method: 'clevertap.popupCallback = (notificationData) => {...}',
      registered: true
    };
  }
  return { method: 'clevertap.popupCallback', registered: false };
}

export function raiseCleverTapPopupNotificationClicked(notificationObj) {
  const clevertap = getCleverTapInstance();
  const validObj = notificationObj || {
    msgId: `camp_custom_html_${Date.now()}`,
    pivotId: 'Variant_HTML_1'
  };

  if (clevertap && typeof clevertap.raisePopupNotificationClicked === 'function') {
    try {
      clevertap.raisePopupNotificationClicked(validObj);
      console.log('[CleverTap Web SDK] raisePopupNotificationClicked invoked with:', validObj);
    } catch (error) {
      console.warn('[CleverTap Web SDK] raisePopupNotificationClicked error:', error);
    }
  }

  return {
    method: 'clevertap.raisePopupNotificationClicked(notificationObj)',
    notificationObj: validObj
  };
}

// 16. DESKTOP EXIT INTENT DETECTION LISTENER
// Monitors pointer movement towards window top edge (desktop viewports > 480px)
export function setupCleverTapExitIntentListener(onExitIntentCallback) {
  if (typeof window === 'undefined') return () => {};

  function handleMouseLeave(event) {
    // Exit intent triggers when user moves pointer outside the browser window (desktop only)
    if (window.innerWidth <= 480) return; // Desktop only
    if (event.clientY <= 10) {
      if (typeof onExitIntentCallback === 'function') {
        onExitIntentCallback({
          trigger: 'mouse_leave_top',
          clientY: event.clientY,
          viewportWidth: window.innerWidth,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  window.document.documentElement.addEventListener('mouseleave', handleMouseLeave);

  return function cleanup() {
    window.document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
  };
}

// 17. PIP (PICTURE-IN-PICTURE) ANCHOR POSITIONS & BREAKPOINTS
export const PIP_ANCHOR_POSITIONS = [
  'center',
  'top-left',
  'top',
  'top-right',
  'left',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right'
];

export function getPipPositionClasses(anchor = 'bottom-right') {
  switch (anchor) {
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'top-left':
      return 'top-5 left-5';
    case 'top':
      return 'top-5 left-1/2 -translate-x-1/2';
    case 'top-right':
      return 'top-5 right-5';
    case 'left':
      return 'top-1/2 left-5 -translate-y-1/2';
    case 'right':
      return 'top-1/2 right-5 -translate-y-1/2';
    case 'bottom-left':
      return 'bottom-5 left-5';
    case 'bottom':
      return 'bottom-5 left-1/2 -translate-x-1/2';
    case 'bottom-right':
    default:
      return 'bottom-5 right-5';
  }
}

export function resolvePipClickAction(pipConfig = {}) {
  if (typeof window === 'undefined') return pipConfig.desktopAction || 'open_details';
  const isDesktop = window.innerWidth > 480;
  if (isDesktop) {
    return pipConfig.display?.pip?.onClick || pipConfig.desktopAction || 'open_details';
  }
  // Mobile <= 480px: falls back to display.pip if display.mobile.pip is not set
  return pipConfig.display?.mobile?.pip?.onClick || pipConfig.display?.pip?.onClick || pipConfig.mobileAction || 'open_details';
}

// ============================================================================
// 17. WEB PUSH (VAPID PROTOCOL, SOFT PROMPT, SERVICE WORKER & PERMISSIONS)
// Official Documentation: https://developer.clevertap.com/docs/web-push
// ============================================================================

// 17.1 CHECK CLEVERTAP SDK VERSION (VAPID requires >= 1.1.0, Custom VAPID + Soft Prompt >= 2.7.1)
export function getCleverTapSdkVersion() {
  const clevertap = getCleverTapInstance();
  let rawVersion = '3.0.3';
  if (clevertap && typeof clevertap.getSDKVersion === 'function') {
    try {
      rawVersion = clevertap.getSDKVersion();
    } catch {
      rawVersion = '3.0.3';
    }
  }

  // Parse numeric version, e.g. "web-sdk-v3.0.3" -> "3.0.3"
  const cleanVersion = String(rawVersion).replace(/^[^\d]*/, '');
  const [major = 3, minor = 0, patch = 0] = cleanVersion.split('.').map(Number);

  const meetsVapidRequirement = major > 1 || (major === 1 && minor >= 1);
  const meetsCustomVapidSoftPrompt = major > 2 || (major === 2 && (minor > 7 || (minor === 7 && patch >= 1)));

  return {
    raw: rawVersion,
    version: cleanVersion,
    major,
    minor,
    patch,
    meetsVapidRequirement, // >= 1.1.0
    meetsCustomVapidSoftPrompt // >= 2.7.1
  };
}

// 17.2 BROWSER COMPATIBILITY & FEATURE MATRIX DETECTOR
// Evaluates Chrome, Firefox, Safari capabilities against official CleverTap documentation
export function getBrowserWebPushSupport() {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      browser: 'SSR',
      os: 'unknown',
      secureOrigin: false,
      serviceWorker: false,
      pushManager: false,
      notificationApi: false,
      features: {}
    };
  }

  const ua = window.navigator.userAgent || '';
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Detect OS
  let os = 'other';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'ios';
  else if (/Android/i.test(ua)) os = 'android';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macos';
  else if (/Windows NT/i.test(ua)) os = 'windows';
  else if (/Linux/i.test(ua)) os = 'linux';

  // Detect Browser & Version
  let browser = 'other';
  let version = 0;

  if (/Edg\//i.test(ua)) {
    browser = 'edge';
    const match = ua.match(/Edg\/(\d+)/);
    if (match) version = parseInt(match[1], 10);
  } else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua)) {
    browser = 'chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    if (match) version = parseInt(match[1], 10);
  } else if (/Firefox\//i.test(ua)) {
    browser = 'firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    if (match) version = parseInt(match[1], 10);
  } else if (/Safari\//i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) {
    browser = 'safari';
    const match = ua.match(/Version\/(\d+)/);
    if (match) version = parseInt(match[1], 10);
  }

  const hasServiceWorker = 'serviceWorker' in window.navigator;
  const hasPushManager = 'PushManager' in window;
  const hasNotificationApi = 'Notification' in window;

  // iOS Safari requires Add to Home Screen (Standalone PWA mode) to register Web Push
  const isIos = os === 'ios';
  const isStandalonePwa = Boolean(
    (window.navigator && window.navigator.standalone) ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  );

  // Supported browsers from docs:
  // Chrome: v42+ (desktop and android)
  // Firefox: v44+ (desktop), v48+ (android)
  // Safari: v16+ (macOS), v16.4+ (iOS standalone)
  let meetsBrowserVersion = false;
  if (browser === 'chrome' && (version >= 42 || version === 0)) meetsBrowserVersion = true;
  else if (browser === 'firefox' && (version >= 44 || version === 0)) meetsBrowserVersion = true;
  else if (browser === 'safari' && (version >= 16 || version === 0)) {
    meetsBrowserVersion = isIos ? (isStandalonePwa && (version >= 16 || version === 0)) : true;
  } else if (browser === 'edge' && (version >= 79 || version === 0)) meetsBrowserVersion = true;

  const supported = isSecure && hasServiceWorker && hasPushManager && hasNotificationApi;

  // Features available across browsers (CleverTap Documentation Table)
  const features = {
    cta: browser === 'chrome' ? 'v53+ (desktop, android)' : 'No',
    icon: browser === 'chrome'
      ? 'v33+ (desktop), v42+ (android)'
      : browser === 'firefox'
        ? 'v26+ (desktop, android)'
        : 'No',
    image: browser === 'chrome' ? 'v56+ (desktop, android)' : 'No',
    requiresInteraction: browser === 'chrome'
      ? 'v47+ (desktop, android)'
      : browser === 'firefox'
        ? 'v117+ (desktop, android)'
        : 'No'
  };

  return {
    supported,
    browser,
    version,
    os,
    secureOrigin: isSecure,
    serviceWorker: hasServiceWorker,
    pushManager: hasPushManager,
    notificationApi: hasNotificationApi,
    isIos,
    isStandalonePwa,
    meetsBrowserVersion,
    features,
    serviceWorkerPath: '/clevertap_sw.js',
    manifestPath: '/manifest.json'
  };
}

// 17.3 NOTIFICATION PERMISSION STATE
export function getNotificationPermissionStatus() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return window.Notification.permission; // 'default' | 'granted' | 'denied'
}

// 17.4 REQUEST NATIVE BROWSER PERMISSION DIRECTLY
export async function requestNativeBrowserPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await window.Notification.requestPermission();
    return result;
  } catch (error) {
    console.warn('[CleverTap Web Push] Native permission request error:', error);
    return window.Notification.permission;
  }
}

// 17.5 REJECTION COOLDOWN & 1-WEEK FREQUENCY RULE CHECK
// CleverTap API automatically suppresses clevertap.notifications.push if user rejected < 1 week ago
const STORAGE_KEY_PUSH_REJECTED = 'ct_webpush_last_rejected_ts';

export function getPushRejectionCooldown(askAgainTimeInSeconds = null) {
  if (typeof window === 'undefined') return { inCooldown: false, remainingSeconds: 0 };
  const raw = window.localStorage.getItem(STORAGE_KEY_PUSH_REJECTED);
  if (!raw) return { inCooldown: false, remainingSeconds: 0 };

  const lastRejectedMs = parseInt(raw, 10);
  const nowMs = Date.now();
  const elapsedSeconds = Math.floor((nowMs - lastRejectedMs) / 1000);

  // Standard CleverTap cooldown is 1 week (7 days = 604800 seconds).
  // If user passes askAgainTimeInSeconds (e.g. 5 seconds for testing), respect it.
  const requiredCooldownSeconds = askAgainTimeInSeconds !== null && !isNaN(askAgainTimeInSeconds)
    ? Number(askAgainTimeInSeconds)
    : 7 * 24 * 60 * 60;

  const remainingSeconds = Math.max(0, requiredCooldownSeconds - elapsedSeconds);
  return {
    inCooldown: remainingSeconds > 0,
    remainingSeconds,
    elapsedSeconds,
    lastRejectedAt: new Date(lastRejectedMs).toISOString()
  };
}

export function recordPushRejection(timestamp = Date.now()) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY_PUSH_REJECTED, String(timestamp));
}

export function clearPushRejectionCooldown() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY_PUSH_REJECTED);
}

// 17.6 REQUEST USER PERMISSION (SOFT PROMPT VIA clevertap.notifications.push)
// Calling signature matching documentation:
// clevertap.notifications.push({
//   "titleText": "Would you like to receive Push Notifications?",
//   "bodyText": "We promise to only send you relevant content and give you updates on your transactions",
//   "okButtonText": "Sign me up!",
//   "rejectButtonText": "No thanks",
//   "okButtonColor": "#F28046",
//   "askAgainTimeInSeconds": 5,
//   "serviceWorkerPath": "/clevertap_sw.js"
// });
export function requestCleverTapPushPermission(customOptions = {}) {
  const clevertap = getCleverTapInstance();

  const options = {
    titleText: customOptions.titleText || 'Would you like to receive Push Notifications?',
    bodyText: customOptions.bodyText || 'We promise to only send you relevant content and give you updates on your transactions',
    okButtonText: customOptions.okButtonText || 'Sign me up!',
    rejectButtonText: customOptions.rejectButtonText || 'No thanks',
    okButtonColor: customOptions.okButtonColor || '#4f46e5',
    askAgainTimeInSeconds: customOptions.askAgainTimeInSeconds ?? 5,
    serviceWorkerPath: customOptions.serviceWorkerPath || '/clevertap_sw.js',
    skipDialog: Boolean(customOptions.skipDialog)
  };

  const cooldown = getPushRejectionCooldown(options.askAgainTimeInSeconds);

  if (cooldown.inCooldown) {
    console.log(`[CleverTap Web Push] Permission prompt suppressed by 1-week/cooldown frequency rule (${cooldown.remainingSeconds}s remaining).`);
    return {
      status: 'SUPPRESSED_COOLDOWN',
      cooldown,
      payload: options
    };
  }

  if (clevertap) {
    try {
      if (!clevertap.notifications) {
        clevertap.notifications = [];
      }
      clevertap.notifications.push(options);
      console.log('[CleverTap Web Push] clevertap.notifications.push invoked with payload:', options);
    } catch (error) {
      console.warn('[CleverTap Web Push] Error invoking clevertap.notifications.push:', error);
    }
  }

  return {
    status: 'PROMPT_REQUESTED',
    payload: options,
    method: 'clevertap.notifications.push({...})'
  };
}

// 17.7 TOKEN MIGRATION SIMULATION (Handling 3 Cases from Official Documentation)
// Case 1: Existing Users - Registered with previous service provider -> Auto-migrated, soft prompt skipped
// Case 2: Existing Users - Declined with previous service provider -> No token generated, soft prompt skipped
// Case 3: New Users -> Soft prompt displayed, token generated on acceptance
export function evaluateTokenMigration(scenario) {
  switch (scenario) {
    case 'registered':
      return {
        scenario: 'Case 1: Existing Users - Registered with previous provider',
        showSoftPrompt: false,
        tokenMigrated: true,
        description: 'User already accepted Web Push on this domain through previous service provider. Soft-prompt is bypassed, and user token is automatically migrated to CleverTap.'
      };
    case 'declined':
      return {
        scenario: 'Case 2: Existing Users - Declined with previous provider',
        showSoftPrompt: false,
        tokenMigrated: false,
        description: 'User previously declined notifications on this domain. Token is not generated and soft-prompt is not displayed.'
      };
    case 'new_user':
    default:
      return {
        scenario: 'Case 3: New Users',
        showSoftPrompt: true,
        tokenMigrated: false,
        description: 'Calling clevertap.notifications.push displays the soft-prompt. When accepted, a Web Push token is generated and registered with CleverTap.'
      };
  }
}

// 17.8 CHECK SERVICE WORKER REGISTRATION IN BROWSER
export async function checkServiceWorkerRegistration(swPath = '/clevertap_sw.js') {
  if (typeof window === 'undefined' || !('serviceWorker' in window.navigator)) {
    return { registered: false, scope: null, reason: 'ServiceWorker unsupported' };
  }
  try {
    const reg = await window.navigator.serviceWorker.getRegistration(swPath);
    if (reg) {
      return {
        registered: true,
        scope: reg.scope,
        active: Boolean(reg.active),
        state: reg.active ? reg.active.state : 'installing'
      };
    }
    return { registered: false, scope: null, reason: 'Not yet registered' };
  } catch (error) {
    return { registered: false, scope: null, reason: error.message };
  }
}


