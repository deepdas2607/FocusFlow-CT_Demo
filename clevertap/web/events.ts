// FILE TYPE: CleverTap Event Definitions & Schemas
// PURPOSE: Stores FocusFlow's CleverTap event names, strongly-typed property schemas, and tracking helpers.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import { getCleverTap } from './client';

// ─── 1. Canonical Event Registry ──────────────────────────────────────────────

export const CLEVERTAP_EVENTS = {
  // Authentication & Identity
  USER_REGISTERED: 'User Registered',
  USER_LOGGED_IN: 'User Logged In',
  USER_LOGGED_OUT: 'User Logged Out',

  // Application Navigation & Lifecycle
  APP_LAUNCHED: 'App Launched',
  DASHBOARD_VIEWED: 'Dashboard Viewed',
  PROGRESS_VIEWED: 'Progress Viewed',
  PROFILE_VIEWED: 'Profile Viewed',
  SETTINGS_UPDATED: 'Settings Updated',

  // Tasks (Productivity Pipeline)
  TASK_CREATED: 'Task Created',
  TASK_VIEWED: 'Task Viewed',
  TASK_UPDATED: 'Task Updated',
  TASK_COMPLETED: 'Task Completed',
  TASK_DELETED: 'Task Deleted',

  // Focus Sessions (Core Conversion Funnel)
  FOCUS_SESSION_STARTED: 'Focus Session Started',
  FOCUS_SESSION_PAUSED: 'Focus Session Paused',
  FOCUS_SESSION_RESUMED: 'Focus Session Resumed',
  FOCUS_SESSION_COMPLETED: 'Focus Session Completed',
  FOCUS_SESSION_ABANDONED: 'Focus Session Abandoned',

  // Milestones & Retention
  FIRST_FOCUS_SESSION: 'First Focus Session',
  FIRST_TASK_COMPLETED: 'First Task Completed',
  DAILY_GOAL_COMPLETED: 'Daily Goal Completed',
  STREAK_ACHIEVED: 'Streak Achieved',

  // Engagement & Triggers
  EXIT_INTENT_TRIGGERED: 'Exit Intent Triggered',
  WEB_PUSH_OPT_IN_SHOWN: 'Web Push Opt-In Shown',
  WEB_PUSH_SUBSCRIBED: 'Web Push Subscribed',
  WEB_PUSH_DISMISSED: 'Web Push Dismissed',
  WEB_INBOX_OPENED: 'Web Inbox Opened',
  CONSENT_UPDATED: 'Consent Updated',
} as const;

export type CleverTapEventName = (typeof CLEVERTAP_EVENTS)[keyof typeof CLEVERTAP_EVENTS];

// ─── 2. Strongly-Typed Event Property Schemas ─────────────────────────────────

export interface TaskEventProperties {
  category: string;
  priority: string;
  timeTaken?: number; // In minutes
  taskTitleLength?: number;
}

export interface FocusSessionStartedProperties {
  duration: number; // In minutes (25, 45, 60)
  taskCategory?: string;
  hasLinkedTask: boolean;
  sessionHourOfDay?: number;
}

export interface FocusSessionCompletedProperties {
  duration: number;
  taskCategory?: string;
  completedOnTime: boolean;
  elapsedMinutes: number;
  totalCompletedSessionsSoFar?: number;
}

export interface FocusSessionAbandonedProperties {
  duration: number;
  elapsedMinutes: number;
  taskCategory?: string;
  completionPercentage: number;
}

export interface ExitIntentProperties {
  page: string;
  activeTasksCount: number;
  focusMinutesToday: number;
}

// ─── 3. Event Dispatchers ─────────────────────────────────────────────────────

/**
 * Pushes a custom event without properties to CleverTap.
 */
export function trackEvent(eventName: string): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.event.push(eventName);
    console.log(`[CleverTap Standalone Event] Tracked: "${eventName}"`);
  } catch (error) {
    console.warn(`[CleverTap Standalone Event] Error tracking "${eventName}":`, error);
  }
}

/**
 * Pushes a custom event with typed schema properties to CleverTap.
 */
export function trackEventWithProperties(
  eventName: string,
  properties: Record<string, any>
): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.event.push(eventName, properties);
    console.log(`[CleverTap Standalone Event] Tracked: "${eventName}"`, properties);
  } catch (error) {
    console.warn(`[CleverTap Standalone Event] Error tracking "${eventName}":`, error);
  }
}

// ─── 4. Domain-Specific Helpers (Ready for Future Reconnection) ───────────────

export function trackTaskCreated(properties: TaskEventProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.TASK_CREATED, {
    Category: properties.category,
    Priority: properties.priority,
    'Title Length': properties.taskTitleLength ?? 0,
  });
}

export function trackTaskCompleted(properties: TaskEventProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.TASK_COMPLETED, {
    Category: properties.category,
    Priority: properties.priority,
    'Time Taken (minutes)': properties.timeTaken ?? 0,
  });
}

export function trackFocusSessionStarted(properties: FocusSessionStartedProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.FOCUS_SESSION_STARTED, {
    'Duration (minutes)': properties.duration,
    'Task Category': properties.taskCategory || 'None',
    'Has Linked Task': properties.hasLinkedTask,
    'Hour of Day': properties.sessionHourOfDay ?? new Date().getHours(),
  });
}

export function trackFocusSessionCompleted(properties: FocusSessionCompletedProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.FOCUS_SESSION_COMPLETED, {
    'Duration (minutes)': properties.duration,
    'Task Category': properties.taskCategory || 'None',
    'Completed On Time': properties.completedOnTime,
    'Elapsed Minutes': properties.elapsedMinutes,
    'Total Completed Sessions': properties.totalCompletedSessionsSoFar ?? 1,
  });
}

export function trackFocusSessionAbandoned(properties: FocusSessionAbandonedProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.FOCUS_SESSION_ABANDONED, {
    'Duration (minutes)': properties.duration,
    'Elapsed Minutes': properties.elapsedMinutes,
    'Task Category': properties.taskCategory || 'None',
    'Completion Percentage': properties.completionPercentage,
  });
}

export function trackStreakAchieved(streakDays: number): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.STREAK_ACHIEVED, {
    'Streak Days': streakDays,
  });
}
