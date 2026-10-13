// ============================================================================
// FILE: frontend/src/services/clevertapSdkService.js
// PURPOSE: Central wrapper for CleverTap Web SDK methods (Day 1 to Day 30 training).
// Each function formats the exact CleverTap payload for the Payload Inspector
// and contains the ready-to-enable clevertap-web-sdk call.
// ============================================================================

// Initializes the CleverTap Web SDK with Account ID and Region
export function initializeCleverTapSdk(accountId, region = 'in1') {
  // Ready for Day 1 Web SDK Integration:
  // import clevertap from 'clevertap-web-sdk';
  // clevertap.init(accountId, region);
  return {
    method: 'clevertap.init(accountId, region)',
    accountId: accountId || 'TEST-ACCOUNT-ID',
    region,
    status: 'SDK_STUB_READY'
  };
}

// Identifies a user on login or registration using clevertap.onUserLogin.push
export function sendCleverTapUserLogin(user) {
  const sitePayload = {
    Site: {
      Name: user.name,
      Identity: user.id,
      Email: user.email,
      Phone: user.phone,
      DOB: user.dob ? new Date(user.dob) : undefined,
      Occupation: user.occupation,
      'Focus Goal': user.focusGoal,
      'MSG-email': Boolean(user.preferences?.marketingConsent),
      'MSG-push': Boolean(user.preferences?.notificationsEnabled),
      'MSG-sms': true,
      'MSG-whatsapp': true
    }
  };

  // Ready for Day 2 Identity Management:
  // clevertap.onUserLogin.push(sitePayload);
  return {
    method: 'clevertap.onUserLogin.push',
    payload: sitePayload
  };
}

// Updates user profile attributes and messaging flags using clevertap.profile.push
export function sendCleverTapProfileUpdate(user) {
  const sitePayload = {
    Site: {
      Name: user.name,
      Identity: user.id,
      Email: user.email,
      Phone: user.phone,
      Occupation: user.occupation,
      'Focus Goal': user.focusGoal,
      'Notifications Enabled': Boolean(user.preferences?.notificationsEnabled),
      'Productivity Reminders': Boolean(user.preferences?.productivityReminders),
      'Session Reminders': Boolean(user.preferences?.sessionReminders),
      'Weekly Summary': Boolean(user.preferences?.weeklySummary),
      'MSG-email': Boolean(user.preferences?.marketingConsent),
      'MSG-push': Boolean(user.preferences?.notificationsEnabled)
    }
  };

  // Ready for Day 2 Profile Push:
  // clevertap.profile.push(sitePayload);
  return {
    method: 'clevertap.profile.push',
    payload: sitePayload
  };
}

// Tracks a custom user action or event using clevertap.event.push
export function sendCleverTapEvent(eventName, eventProperties = {}) {
  // Ready for Day 3 Custom Event Tracking:
  // clevertap.event.push(eventName, eventProperties);
  return {
    method: 'clevertap.event.push',
    eventName,
    eventProperties
  };
}

// Triggers the Web Push notification opt-in prompt using clevertap.notifications.push
export function requestCleverTapWebPushOptIn() {
  const pushConfig = {
    titleText: 'Stay in flow with FocusFlow reminders?',
    bodyText: 'Get gentle nudges for your Pomodoro sessions and daily focus goals.',
    okButtonText: 'Allow Notifications',
    rejectButtonText: 'Later',
    okButtonColor: '#2563EB',
    serviceWorkerPath: '/clevertap_sw.js'
  };

  // Ready for Web Push Campaign setup:
  // clevertap.notifications.push(pushConfig);
  return {
    method: 'clevertap.notifications.push',
    payload: pushConfig
  };
}

// Updates GDPR privacy opt-out and data tracking settings using clevertap.privacy.push
export function sendCleverTapPrivacyUpdate(optOutBoolean, useIpBoolean = false) {
  const privacyPayload = {
    optOut: Boolean(optOutBoolean),
    useIP: Boolean(useIpBoolean)
  };

  // Ready for GDPR Privacy Compliance:
  // clevertap.privacy.push(privacyPayload);
  return {
    method: 'clevertap.privacy.push',
    payload: privacyPayload
  };
}
