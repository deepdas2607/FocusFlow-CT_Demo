/**
 * CleverTap Event Names - Central registry of all event names in FocusFlow.
 *
 * PURPOSE IN A CLEVERTAP DEMO / LEARNING APP:
 * This registry forms the backbone for all CleverTap analytics and engagement:
 *
 * 1. FUNNEL ANALYSIS:
 *    Step 1: 'User Registered'
 *    Step 2: 'Task Created'
 *    Step 3: 'Focus Session Started'
 *    Step 4: 'Focus Session Completed'
 *    -> Measure conversion and drop-off rates across the core user activation funnel.
 *
 * 2. FLOWS ANALYSIS:
 *    Analyze pathing: e.g. from 'Dashboard Viewed' -> 'Focus Session Started' vs
 *    'Dashboard Viewed' -> 'Task Created' -> 'Focus Session Started'.
 *
 * 3. PIVOT ANALYSIS:
 *    Cross-tabulate multi-dimensional event properties:
 *    e.g. 'Task Category' (Work vs Study) x 'Priority' (High vs Low) x 'Completed On Time' (true vs false).
 *
 * 4. RFM & LIFECYCLE ANALYSIS:
 *    - Recency: Measured via timestamps of 'Focus Session Completed' / 'User Logged In'
 *    - Frequency: Count of 'Focus Session Completed'
 *    - Monetary / Value Metric: Sum of 'Duration (minutes)' or 'Elapsed Minutes'
 *
 * 5. CAMPAIGNS & TRIGGERED MESSAGING:
 *    - Web Push: Triggered after 'Focus Session Abandoned' or inactivity
 *    - In-App Web Pop-ups: Triggered on 'Streak Achieved' or 'First Focus Session'
 *    - Exit Intent Overlay: Triggered on 'Exit Intent Triggered'
 *    - Web Inbox: Persistent announcements and milestone awards
 */

export const CLEVERTAP_EVENTS = {
  // ─── Authentication & Identity ────────────────────────────────────────────
  /** Fired upon successful registration; triggers Welcome onboarding campaigns */
  USER_REGISTERED: 'User Registered',

  /** Fired on login; updates session recency for RFM & lifecycle analysis */
  USER_LOGGED_IN: 'User Logged In',

  /** Fired on logout; marks session termination */
  USER_LOGGED_OUT: 'User Logged Out',

  // ─── Application Lifecycle ────────────────────────────────────────────────
  /** Fired when the web application loads in the browser */
  APP_LAUNCHED: 'App Launched',

  // ─── Navigation & Flow Tracking ───────────────────────────────────────────
  /** Screen view: Dashboard (used for flow pathing and engagement scoring) */
  DASHBOARD_VIEWED: 'Dashboard Viewed',

  /** Screen view: Progress & Stats page (signals analytics interest) */
  PROGRESS_VIEWED: 'Progress Viewed',

  /** Screen view: Profile/Settings (precedes preference changes) */
  PROFILE_VIEWED: 'Profile Viewed',

  /** Fired when profile or notification preferences are updated */
  SETTINGS_UPDATED: 'Settings Updated',

  // ─── Task Events (Productivity Pipeline) ──────────────────────────────────
  /** Fired when a task is created; contains Category and Priority properties */
  TASK_CREATED: 'Task Created',

  /** Fired when inspecting task details */
  TASK_VIEWED: 'Task Viewed',

  /** Fired when task details (priority/title/category) are modified */
  TASK_UPDATED: 'Task Updated',

  /** Fired when task is checked off; contains Category, Priority, Time Taken */
  TASK_COMPLETED: 'Task Completed',

  /** Fired when task is deleted */
  TASK_DELETED: 'Task Deleted',

  // ─── Focus Session Events (Core Value Action) ─────────────────────────────
  /** Funnel step: focus session initiated (Duration, Category, Task ID) */
  FOCUS_SESSION_STARTED: 'Focus Session Started',

  /** Timer paused during active session */
  FOCUS_SESSION_PAUSED: 'Focus Session Paused',

  /** Timer resumed after pause */
  FOCUS_SESSION_RESUMED: 'Focus Session Resumed',

  /** Primary conversion goal: completed session (Duration, Elapsed, On-Time flag) */
  FOCUS_SESSION_COMPLETED: 'Focus Session Completed',

  /** Abandonment trigger: user quit early (Elapsed, Completion Percentage) */
  FOCUS_SESSION_ABANDONED: 'Focus Session Abandoned',

  // ─── Milestone Events (Gamification & Retention) ──────────────────────────
  /** Activation milestone: first ever focus session completed */
  FIRST_FOCUS_SESSION: 'First Focus Session',

  /** Activation milestone: first ever task completed */
  FIRST_TASK_COMPLETED: 'First Task Completed',

  /** Daily retention goal: all today's tasks completed */
  DAILY_GOAL_COMPLETED: 'Daily Goal Completed',

  /** Habit milestone: streak achieved (7, 14, 30 days) */
  STREAK_ACHIEVED: 'Streak Achieved',

  // ─── Behavioral & Engagement Triggers ─────────────────────────────────────
  /** Exit intent detected when mouse leaves viewport; triggers web overlay/pop-up */
  EXIT_INTENT_TRIGGERED: 'Exit Intent Triggered',

  /** Web Push soft prompt shown to user */
  WEB_PUSH_OPT_IN_SHOWN: 'Web Push Opt-In Shown',

  /** User granted web push notification permissions */
  WEB_PUSH_SUBSCRIBED: 'Web Push Subscribed',

  /** User dismissed or rejected push prompt */
  WEB_PUSH_DISMISSED: 'Web Push Dismissed',

  /** User opened the persistent Web Inbox panel */
  WEB_INBOX_OPENED: 'Web Inbox Opened',

  /** GDPR / Privacy consent preferences changed */
  CONSENT_UPDATED: 'Consent Updated',
} as const;

// TypeScript union type of all event name strings
export type CleverTapEventName = (typeof CLEVERTAP_EVENTS)[keyof typeof CLEVERTAP_EVENTS];
