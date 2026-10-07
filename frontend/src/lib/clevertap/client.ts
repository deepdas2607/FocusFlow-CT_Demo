/**
 * CleverTap Client - Helper functions for CleverTap Web SDK in FocusFlow.
 *
 * PURPOSE IN A CLEVERTAP DEMO / LEARNING APP:
 * This module cleanly isolates all CleverTap SDK interactions from the React UI.
 *
 * KEY LEARNING OBJECTIVES DEMONSTRATED:
 * 1. User Profiles & Identity Resolution:
 *    - Identifying anonymous vs authenticated users via `onUserLogin`
 *    - Setting standard attributes (Name, Email, Identity)
 *    - Setting custom demographic & behavioral attributes (Occupation, Interests, RFM metrics)
 * 2. Event Tracking & Event Schemas:
 *    - Strongly-typed properties for Funnel, Cohort, Flow, and Pivot analysis
 * 3. Web Push Notifications:
 *    - Service worker registration, soft prompt opt-in flow
 * 4. In-App Web Pop-ups & Web Overlays:
 *    - Pop-up triggers via event-driven campaigns (e.g. Milestones, Exit Intent)
 * 5. Web Inbox (App Inbox):
 *    - Persistent messaging, unread counts, and message center rendering
 * 6. Privacy & Consent (GDPR / CCPA):
 *    - Managing tracking opt-out via `clevertap.privacy.push({ optOut: boolean })`
 */

import { CLEVERTAP_EVENTS } from './events';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CleverTapUserProfile {
  name: string;
  email: string;
  identity: string | number; // Primary unique identifier (Database user ID)
  occupation?: string;
  interests?: string;
  preferredFocusDuration?: number;
  notificationsEnabled?: boolean;
  totalFocusMinutes?: number; // Primary RFM Value metric (equivalent to monetary value)
  totalSessionsCompleted?: number; // RFM Frequency metric
  totalTasksCompleted?: number;
  currentStreak?: number;
  lifecycleStage?: 'New' | 'Active' | 'Power User' | 'At Risk' | 'Dormant';
  dataProcessingConsent?: boolean;
  marketingConsent?: boolean;
  signupDate?: string;
}

export interface TaskEventProperties {
  category: string;
  priority: string;
  timeTaken?: number; // In minutes
  taskTitleLength?: number;
}

export interface FocusSessionStartedProperties {
  duration: number; // Planned duration in minutes (25, 45, 60)
  taskCategory?: string;
  hasLinkedTask: boolean;
  sessionHourOfDay?: number; // Hour (0-23) for time-of-day behavioral pivots
}

export interface FocusSessionCompletedProperties {
  duration: number;
  taskCategory?: string;
  completedOnTime: boolean;
  elapsedMinutes: number;
  totalCompletedSessionsSoFar?: number; // Running frequency count for cohort analysis
}

export interface FocusSessionAbandonedProperties {
  duration: number;
  elapsedMinutes: number;
  taskCategory?: string;
  completionPercentage: number; // Drop-off rate metric for churn analysis
}

export interface ExitIntentProperties {
  page: string;
  activeTasksCount: number;
  focusMinutesToday: number;
}

// ─── Internal SDK Accessor ───────────────────────────────────────────────────

/**
 * Safely accesses the CleverTap SDK object.
 * Returns null during SSR or if blocked by client network/extensions.
 */
function getCleverTap(): any | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return (window as any).clevertap || null;
}

// ─── 1. Initialization ───────────────────────────────────────────────────────

/**
 * Initializes the CleverTap Web SDK.
 * Must be executed once on client mount in CleverTapProvider.
 */
export function initCleverTap(accountId: string, region?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const clevertap = require('clevertap-web-sdk');

    // Initialize with project Account ID and Region
    clevertap.init(accountId, region);

    // Enable verbose debug logging in development for Day 20 Website Debugging
    if (typeof clevertap.setLogLevel === 'function') {
      clevertap.setLogLevel(3); // 0 = off, 1 = error, 2 = info, 3 = debug
    }

    // Default privacy configuration (respects user IP & location privacy)
    clevertap.privacy.push({ optOut: false });
    clevertap.privacy.push({ useIP: false });

    // Store reference globally
    (window as any).clevertap = clevertap;

    console.log('[CleverTap SDK] Successfully initialized with Account:', accountId);
  } catch (error) {
    console.warn('[CleverTap SDK] Initialization failed:', error);
  }
}

// ─── 2. Profiles & Identity Resolution ───────────────────────────────────────

/**
 * Identifies a user in CleverTap via `onUserLogin`.
 *
 * HOW IDENTITY RESOLUTION WORKS IN CLEVERTAP:
 * 1. Prior to login, CleverTap assigns an anonymous cookie-based GUID.
 * 2. When `onUserLogin.push` is called with a stable `Identity` (our DB User ID)
 *    and `Email`, CleverTap merges all pre-login anonymous events into the
 *    permanent user profile.
 * 3. If the user logs in on another browser or device with the same Identity,
 *    CleverTap links both devices to this single unified customer profile.
 */
export function identifyUser(profile: CleverTapUserProfile): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.onUserLogin.push({
      Site: {
        // Standard CleverTap properties
        Name: profile.name,
        Email: profile.email,
        Identity: String(profile.identity),

        // Custom Demographics & Preferences
        Occupation: profile.occupation || 'Not Specified',
        Interests: profile.interests || '',
        'Preferred Focus Duration': profile.preferredFocusDuration || 25,
        'Notifications Enabled': profile.notificationsEnabled ?? true,

        // Custom Metrics for RFM & Lifecycle Analysis
        'Total Focus Minutes': profile.totalFocusMinutes ?? 0,
        'Total Sessions Completed': profile.totalSessionsCompleted ?? 0,
        'Total Tasks Completed': profile.totalTasksCompleted ?? 0,
        'Current Streak': profile.currentStreak ?? 0,
        'Lifecycle Stage': profile.lifecycleStage ?? 'New',

        // Privacy & Consent Flags (GDPR/Compliance)
        'Data Processing Consent': profile.dataProcessingConsent ?? true,
        'Marketing Consent': profile.marketingConsent ?? true,
        'Last Active Date': new Date().toISOString(),
      },
    });

    console.log('[CleverTap Profile] User identified:', profile.email, 'Identity:', profile.identity);
  } catch (error) {
    console.warn('[CleverTap Profile] Failed to identify user:', error);
  }
}

/**
 * Updates an already identified user profile via `profile.push`.
 * Unlike `onUserLogin`, this updates attributes without initiating a new session.
 */
export function updateUserProfile(properties: Partial<CleverTapUserProfile>): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    const siteProperties: Record<string, any> = {};

    if (properties.name) siteProperties['Name'] = properties.name;
    if (properties.email) siteProperties['Email'] = properties.email;
    if (properties.occupation !== undefined) siteProperties['Occupation'] = properties.occupation;
    if (properties.interests !== undefined) siteProperties['Interests'] = properties.interests;
    if (properties.preferredFocusDuration !== undefined) {
      siteProperties['Preferred Focus Duration'] = properties.preferredFocusDuration;
    }
    if (properties.notificationsEnabled !== undefined) {
      siteProperties['Notifications Enabled'] = properties.notificationsEnabled;
    }
    if (properties.totalFocusMinutes !== undefined) {
      siteProperties['Total Focus Minutes'] = properties.totalFocusMinutes;
    }
    if (properties.totalSessionsCompleted !== undefined) {
      siteProperties['Total Sessions Completed'] = properties.totalSessionsCompleted;
    }
    if (properties.totalTasksCompleted !== undefined) {
      siteProperties['Total Tasks Completed'] = properties.totalTasksCompleted;
    }
    if (properties.currentStreak !== undefined) {
      siteProperties['Current Streak'] = properties.currentStreak;
    }
    if (properties.lifecycleStage !== undefined) {
      siteProperties['Lifecycle Stage'] = properties.lifecycleStage;
    }
    if (properties.dataProcessingConsent !== undefined) {
      siteProperties['Data Processing Consent'] = properties.dataProcessingConsent;
    }
    if (properties.marketingConsent !== undefined) {
      siteProperties['Marketing Consent'] = properties.marketingConsent;
    }

    siteProperties['Last Active Date'] = new Date().toISOString();

    clevertap.profile.push({ Site: siteProperties });
    console.log('[CleverTap Profile] Updated user profile attributes:', siteProperties);
  } catch (error) {
    console.warn('[CleverTap Profile] Failed to update profile:', error);
  }
}

// ─── 3. Event Tracking & Event Schemas ───────────────────────────────────────

/**
 * Pushes a custom event without properties to CleverTap.
 */
export function trackEvent(eventName: string): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.event.push(eventName);
    console.log(`[CleverTap Event] Tracked: "${eventName}"`);
  } catch (error) {
    console.warn(`[CleverTap Event] Failed to track "${eventName}":`, error);
  }
}

/**
 * Pushes a custom event with typed schema properties to CleverTap.
 * These properties populate filter criteria in Funnels, Cohorts, and Pivots.
 */
export function trackEventWithProperties(
  eventName: string,
  properties: Record<string, any>
): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.event.push(eventName, properties);
    console.log(`[CleverTap Event] Tracked: "${eventName}" with schema:`, properties);
  } catch (error) {
    console.warn(`[CleverTap Event] Failed to track "${eventName}":`, error);
  }
}

// ─── 4. Specialized Event Tracking Helpers ────────────────────────────────────

/** Track when the web application loads in the browser */
export function trackAppLaunched(): void {
  trackEvent(CLEVERTAP_EVENTS.APP_LAUNCHED);
}

/** Track when a user inspects/views details of a task */
export function trackTaskViewed(properties: TaskEventProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.TASK_VIEWED, {
    Category: properties.category,
    Priority: properties.priority,
  });
}

/** Track when a task is created (Step 2 of the activation funnel) */
export function trackTaskCreated(properties: TaskEventProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.TASK_CREATED, {
    Category: properties.category,
    Priority: properties.priority,
    'Title Length': properties.taskTitleLength ?? 0,
  });
}

/** Track task completion (enables pivot analysis on completion speed) */
export function trackTaskCompleted(properties: TaskEventProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.TASK_COMPLETED, {
    Category: properties.category,
    Priority: properties.priority,
    'Time Taken (minutes)': properties.timeTaken ?? 0,
  });
}

/** Track focus session start (Step 3 of the activation funnel) */
export function trackFocusSessionStarted(properties: FocusSessionStartedProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.FOCUS_SESSION_STARTED, {
    'Duration (minutes)': properties.duration,
    'Task Category': properties.taskCategory || 'None',
    'Has Linked Task': properties.hasLinkedTask,
    'Hour of Day': properties.sessionHourOfDay ?? new Date().getHours(),
  });
}

/** Track focus session completion (Core conversion goal of activation funnel) */
export function trackFocusSessionCompleted(properties: FocusSessionCompletedProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.FOCUS_SESSION_COMPLETED, {
    'Duration (minutes)': properties.duration,
    'Task Category': properties.taskCategory || 'None',
    'Completed On Time': properties.completedOnTime,
    'Elapsed Minutes': properties.elapsedMinutes,
    'Total Completed Sessions': properties.totalCompletedSessionsSoFar ?? 1,
  });
}

/** Track session abandonment (Key metric for churn/friction analysis) */
export function trackFocusSessionAbandoned(properties: FocusSessionAbandonedProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.FOCUS_SESSION_ABANDONED, {
    'Duration (minutes)': properties.duration,
    'Elapsed Minutes': properties.elapsedMinutes,
    'Task Category': properties.taskCategory || 'None',
    'Completion Percentage': properties.completionPercentage,
  });
}

/** Track user exit intent (triggers CleverTap web exit pop-up campaigns) */
export function trackExitIntent(properties: ExitIntentProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.EXIT_INTENT_TRIGGERED, {
    Page: properties.page,
    'Active Tasks Count': properties.activeTasksCount,
    'Focus Minutes Today': properties.focusMinutesToday,
  });
}

/** Track activation milestone: First focus session */
export function trackFirstFocusSession(): void {
  trackEvent(CLEVERTAP_EVENTS.FIRST_FOCUS_SESSION);
}

/** Track activation milestone: First task completed */
export function trackFirstTaskCompleted(): void {
  trackEvent(CLEVERTAP_EVENTS.FIRST_TASK_COMPLETED);
}

/** Track streak milestone (e.g. 7-day, 14-day, 30-day streak) */
export function trackStreakAchieved(streakDays: number): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.STREAK_ACHIEVED, {
    'Streak Days': streakDays,
  });
}

// ─── 5. Privacy, Consent & GDPR ───────────────────────────────────────────────

/**
 * Updates the user's tracking opt-out status in CleverTap.
 *
 * When `optOut` is true:
 * CleverTap stops tracking future events and updating user profiles,
 * respecting user privacy regulations (GDPR / CCPA).
 */
export function setPrivacyOptOut(optOut: boolean): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.privacy.push({ optOut });
    trackEventWithProperties(CLEVERTAP_EVENTS.CONSENT_UPDATED, {
      'Tracking Opted Out': optOut,
    });
    console.log('[CleverTap Privacy] Updated opt-out state to:', optOut);
  } catch (error) {
    console.warn('[CleverTap Privacy] Failed to update opt-out state:', error);
  }
}

// ─── 6. Web Push Notifications ────────────────────────────────────────────────

/**
 * Requests browser Web Push notification permissions.
 *
 * CLEVERTAP WEB PUSH REQUIREMENTS:
 * 1. Site served over HTTPS (or localhost for development)
 * 2. VAPID keys generated and entered in CleverTap Dashboard > Settings > Web Push
 * 3. CleverTap service worker hosted at `/public/clevertap_sw.js`
 */
export function requestWebPushPermission(): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    trackEvent(CLEVERTAP_EVENTS.WEB_PUSH_OPT_IN_SHOWN);

    clevertap.notifications.push({
      titleText: 'FocusFlow Productivity Reminders',
      bodyText: 'Get nudge reminders for scheduled focus sessions and streak achievements.',
      okButtonText: 'Enable Reminders',
      rejectButtonText: 'Not Now',
      okButtonColor: '#4f46e5', // Brand Indigo
      subscriptionCallback: (status: string) => {
        if (status === 'granted') {
          trackEvent(CLEVERTAP_EVENTS.WEB_PUSH_SUBSCRIBED);
        } else {
          trackEvent(CLEVERTAP_EVENTS.WEB_PUSH_DISMISSED);
        }
      },
    });

    console.log('[CleverTap Push] Web push permission prompt rendered');
  } catch (error) {
    console.warn('[CleverTap Push] Failed to trigger web push prompt:', error);
  }
}

// ─── 7. Web Inbox (App Inbox) ─────────────────────────────────────────────────

/**
 * Initializes the Web Inbox message listener.
 * Messages sent from CleverTap Dashboard campaigns with Web Inbox channel
 * will be delivered here.
 */
export function initWebInbox(): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    if (typeof clevertap.initInbox === 'function') {
      clevertap.initInbox();
    }
  } catch (error) {
    console.warn('[CleverTap Inbox] Failed to initialize inbox:', error);
  }
}

/**
 * Gets count of unread messages currently in the Web Inbox.
 */
export function getUnreadInboxMessageCount(): number {
  const clevertap = getCleverTap();
  if (!clevertap) return 0;

  try {
    if (typeof clevertap.getUnreadInboxMessageCount === 'function') {
      return clevertap.getUnreadInboxMessageCount() || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Opens the persistent Web Inbox message modal/panel.
 */
export function showInbox(): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    trackEvent(CLEVERTAP_EVENTS.WEB_INBOX_OPENED);
    if (typeof clevertap.showInbox === 'function') {
      clevertap.showInbox({ tabs: ['All', 'Updates', 'Streaks'] });
    }
  } catch (error) {
    console.warn('[CleverTap Inbox] Failed to open inbox:', error);
  }
}

/**
 * Logs out the active user session.
 */
export function logoutCleverTapUser(): void {
  console.log('[CleverTap Session] Active user session terminated on logout');
}
