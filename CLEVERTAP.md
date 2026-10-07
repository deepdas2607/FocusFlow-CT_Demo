# CleverTap Integration & Learning Guide: FocusFlow

FocusFlow is intentionally architected as a **live data generator** for mastering CleverTap. Rather than faking dashboard graphs inside the web application, FocusFlow produces clean, strongly-typed customer data so you can log into the real **CleverTap Dashboard** and explore every analytics and engagement feature firsthand.

---

## Table of Contents

0. [Training Syllabus Alignment Matrix (Phases P1 & P2)](#0-training-syllabus-alignment-matrix-phases-p1--p2)
1. [Architecture & Design Philosophy](#1-architecture--design-philosophy)
2. [User Profiles & Identity Resolution](#2-user-profiles--identity-resolution)
3. [Event Catalogue & Event Schemas (DRP & Error Streams)](#3-event-catalogue--event-schemas-drp--error-streams)
4. [Funnel Analysis & Real Impact](#4-funnel-analysis--real-impact)
5. [Cohort Analysis](#5-cohort-analysis)
6. [Flows (User Pathing) Analysis](#6-flows-user-pathing-analysis)
7. [Pivot Analysis](#7-pivot-analysis)
8. [RFM (Recency, Frequency, Value) & Bulletins](#8-rfm-recency-frequency-value--bulletins)
9. [Lifecycle Stages & Lifecycle Optimizer](#9-lifecycle-stages--lifecycle-optimizer)
10. [User Segmentation Recipes](#10-user-segmentation-recipes)
11. [Campaigns & Triggered Messaging](#11-campaigns--triggered-messaging)
    - [Web Push Notifications](#web-push-notifications)
    - [In-App Web Pop-ups & Banners](#in-app-web-pop-ups--banners)
    - [Web Inbox (App Inbox)](#web-inbox-app-inbox)
    - [Exit Intent Web Overlays](#exit-intent-web-overlays)
12. [Journeys (Automated Orchestration)](#12-journeys-automated-orchestration)
13. [Personalization with Liquid Templates](#13-personalization-with-liquid-templates)
14. [Privacy, Consent & GDPR Compliance](#14-privacy-consent--gdpr-compliance)
15. [Verification & Live Testing](#15-verification--live-testing)

---

## 0. Training Syllabus Alignment Matrix (Phases P1 & P2)

This table shows how FocusFlow matches your exact training curriculum:

| Phase | Day | Topic & Subtopic | Learning Outcome in Curriculum | How FocusFlow Implements & Proves It |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **Day 2** | **Web: Basic Website & SDK Placement** | Understand where SDK scripts are placed in web architectures | Initialized in [`CleverTapProvider.tsx`](file:///Users/deepkumar/Desktop/Task2_WebApp/frontend/src/components/CleverTapProvider.tsx) avoiding Next.js SSR issues; Service Worker at [`/clevertap_sw.js`](file:///Users/deepkumar/Desktop/Task2_WebApp/frontend/public/clevertap_sw.js). |
| **P1** | **Day 2** | **Setting CleverTap Account** | Create account, access dashboard basics | Tested with Project ID & Region in `frontend/.env.local`; ready for instant drop-in when live credentials arrive. |
| **P1** | **Day 3** | **Profile Creation (CT ID / Identity)** | Understand identity resolution | Anonymous cookie GUID $\rightarrow$ Permanent profile merge via `onUserLogin` with database `Identity` in [`identifyUser()`](file:///Users/deepkumar/Desktop/Task2_WebApp/frontend/src/lib/clevertap/client.ts). |
| **P1** | **Day 3** | **OnUserLogin / Profile Push** | Push profile data & verify on dashboard | `onUserLogin` on register/login; `profile.push` on profile & settings update in [`SettingsPage`](file:///Users/deepkumar/Desktop/Task2_WebApp/frontend/src/app/settings/page.tsx). |
| **P1** | **Day 3** | **Custom User Properties** | Define, send & validate user properties | Rich properties: `Occupation`, `Interests`, `Preferred Focus Duration`, `Total Focus Minutes`, `Total Sessions Completed`, `Lifecycle Stage`. |
| **P1** | **Day 3** | **Events, Schema, DRP & Error Streams** | Instrument events, verify schema, handle DRP & error streams | Strongly typed events in [`events.ts`](file:///Users/deepkumar/Desktop/Task2_WebApp/frontend/src/lib/clevertap/events.ts) & [`client.ts`](file:///Users/deepkumar/Desktop/Task2_WebApp/frontend/src/lib/clevertap/client.ts). Strict type guarantees prevent schema rejection and Error Stream alerts. |
| **P1** | **Day 5** | **Web Push & Pop-ups** | Configure web push & pop-up campaigns | Custom soft-opt-in banner calling `clevertap.notifications.push()`; service worker at `/public/clevertap_sw.js`; web pop-up triggers (`Streak Achieved`, `First Focus Session`). |
| **P1** | **Day 5** | **Web Inbox & Exit Intent** | Web engagement & consent behavior | Persistent bell icon (`id="ct-inbox-button"`) with unread badge counter; `ExitIntentTracker.tsx` firing `Exit Intent Triggered`; GDPR opt-out via `clevertap.privacy.push`. |
| **P2** | **Day 6** | **Campaigns** | Build & trigger campaigns | In-app modals, Web Push, and Web Inbox campaigns ready to attach to FocusFlow events. |
| **P2** | **Day 7** | **Journeys** | Multi-step user journeys | Complete 7-day onboarding & activation journey with conditional branching and wait delays. |
| **P2** | **Day 8** | **Segments, RFM & Bulletins** | Audience segmentation, Bulletins & RFM | Pre-configured segment criteria (Abandoners, Developers, Streak Builders); RFM mapped using Focus Minutes as Monetary value; Web Inbox ready for Bulletins. |
| **P2** | **Day 9** | **Event Analytics, Trends & Cohorts** | Retention decay curves & behavioral trends | Acquisition cohorts based on signup date; tracking recurring focus session completion week-over-week. |
| **P2** | **Day 10** | **Funnels, Real Impact, Flows & Pivots** | Behavior analysis via multi-step funnels & pivots | 4-step core activation funnel; branching paths from Dashboard in Flows; Category $\times$ Duration $\times$ On-Time completion in Pivots; control group lift measurement (Real Impact). |
| **P2** | **Day 10** | **Lifecycle Optimizer & Reports** | Lifecycle stages & campaign reporting | Profiles tracked across New, Active, Power User, At-Risk, Dormant stages; ready for CleverTap Lifecycle Optimizer analysis. |

---

## 1. Architecture & Design Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                    FocusFlow Web App (Browser)              │
│  Next.js 14 Client • TypeScript • React • Tailwind CSS     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
       REST API (JWT Auth)             CleverTap Web SDK (v3)
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Node/Express Backend    │ │     CleverTap Cloud        │
│   Prisma ORM • PostgreSQL    │ │   Profiles • Events • Push │
│  Tasks • Sessions • Auth DB  │ │  Funnels • Cohorts • RFM   │
└──────────────────────────────┘ └────────────────────────────┘
```

### Core Principles
- **No In-App CleverTap Emulation**: The app does not display fake CleverTap dashboards. The UI is a focus tool (tasks, timers, streaks). All telemetry is pushed via the official Web SDK so you can analyze it in the actual CleverTap dashboard.
- **Fail-Soft Isolation**: All SDK calls in `frontend/src/lib/clevertap/client.ts` are guarded by `try/catch`. If an ad-blocker or network disconnect blocks CleverTap, the core application functions without interruption.
- **Client-Side Initialization**: CleverTap relies on browser globals (`window`, `document`). The SDK initializes exclusively on client mount via `CleverTapProvider.tsx`.

---

## 2. User Profiles & Identity Resolution

### How Identity Resolution Works in FocusFlow

When a visitor lands on FocusFlow, CleverTap assigns an **Anonymous GUID** cookie. All browsing actions (e.g. landing page views) are logged against this GUID.

Upon Registration or Login, `identifyUser()` in `client.ts` calls:

```typescript
clevertap.onUserLogin.push({
  Site: {
    Name: user.name,
    Email: user.email,
    Identity: String(user.id), // Database primary key as immutable unique ID
    Occupation: user.occupation,
    Interests: user.interests,
    'Preferred Focus Duration': user.preferredFocusDuration,
    'Notifications Enabled': true,
    'Total Focus Minutes': 0,
    'Total Sessions Completed': 0,
    'Lifecycle Stage': 'New',
    'Data Processing Consent': true,
    'Marketing Consent': true,
    'Last Active Date': new Date().toISOString(),
  }
});
```

### What Happens in CleverTap:
1. **Profile Merging**: The pre-login anonymous events are merged into the identified user profile.
2. **Cross-Device Linking**: If the user logs in from another device or browser with the same `Identity` (`user.id`), CleverTap resolves both devices to one unified profile.
3. **Attribute Updates (`profile.push`)**: When the user edits profile or notification preferences in Settings, `updateUserProfile()` calls `clevertap.profile.push` to update the profile without resetting the session.

### Profile Properties Dictionary

| Property Name | Type | CleverTap Purpose |
| :--- | :--- | :--- |
| `Identity` | String | Unique primary key for multi-device identity resolution |
| `Name` | String | Personalization token for push and in-app templates (`{{Profile.Name}}`) |
| `Email` | String | Communication channel & user identifier |
| `Occupation` | String | Persona segmentation (e.g. Developer, Student, Designer) |
| `Interests` | String | Interest-targeted campaigns (e.g. "contains 'programming'") |
| `Preferred Focus Duration` | Number | Message personalization (`{{Profile.Preferred Focus Duration}}`) |
| `Notifications Enabled` | Boolean | Reachability filtering for campaign delivery |
| `Total Focus Minutes` | Number | **Monetary/Value metric** for RFM analysis |
| `Total Sessions Completed` | Number | **Frequency metric** for RFM analysis |
| `Total Tasks Completed` | Number | Behavioral engagement depth |
| `Current Streak` | Number | Gamification campaigns and streak recognition triggers |
| `Lifecycle Stage` | String | Lifecycle segmentation (`New`, `Active`, `Power User`, `At Risk`, `Dormant`) |
| `Data Processing Consent` | Boolean | Compliance & GDPR consent tracking |
| `Marketing Consent` | Boolean | Regulatory opt-in state |
| `Last Active Date` | String | **Recency metric** for RFM and dormancy calculation |

---

## 3. Event Catalogue & Event Schemas (DRP & Error Streams)

All event names are defined as constants in `frontend/src/lib/clevertap/events.ts`.

### Platform Considerations: Schema, DRP & Error Streams
- **Data Resiliency Policy (DRP)**: CleverTap protects your project from payload corruption and unexpected schema bloat. When strict schema rules or DRP are enforced in your dashboard settings, any incoming event or property that deviates from predefined types is filtered out.
- **Error Streams**: Visible in **CleverTap Dashboard → Settings → Data Management → Error Streams**. If a client sends a numeric string (e.g. `"25"`) where a Number (`25`) was expected, or an unregistered event name, CleverTap flags it in Error Streams.
- **FocusFlow's Solution**: FocusFlow enforces strict TypeScript interfaces (`TaskEventProperties`, `FocusSessionStartedProperties`) so every property dispatched via `client.ts` matches the expected scalar or categorical data type, ensuring **zero payload rejections in Error Streams**.

### Schema Details

```typescript
// 1. Task Created
clevertap.event.push('Task Created', {
  Category: 'Work' | 'Study' | 'Personal' | 'Health' | 'Other',
  Priority: 'Low' | 'Medium' | 'High',
  'Title Length': number
});

// 2. Task Completed
clevertap.event.push('Task Completed', {
  Category: string,
  Priority: string,
  'Time Taken (minutes)': number
});

// 3. Focus Session Started
clevertap.event.push('Focus Session Started', {
  'Duration (minutes)': 25 | 45 | 60,
  'Task Category': string,
  'Has Linked Task': boolean,
  'Hour of Day': 0..23
});

// 4. Focus Session Completed
clevertap.event.push('Focus Session Completed', {
  'Duration (minutes)': number,
  'Task Category': string,
  'Completed On Time': boolean,
  'Elapsed Minutes': number,
  'Total Completed Sessions': number
});

// 5. Focus Session Abandoned
clevertap.event.push('Focus Session Abandoned', {
  'Duration (minutes)': number,
  'Elapsed Minutes': number,
  'Task Category': string,
  'Completion Percentage': number // 0-100% drop-off indicator
});

// 6. Exit Intent Triggered
clevertap.event.push('Exit Intent Triggered', {
  Page: string,
  'Active Tasks Count': number,
  'Focus Minutes Today': number
});

// 7. Streak Achieved
clevertap.event.push('Streak Achieved', {
  'Streak Days': 7 | 14 | 30
});
```

---

## 4. Funnel Analysis

Funnels measure conversion velocity and drop-off between successive user actions.

### Core FocusFlow Activation Funnel in CleverTap

Go to **CleverTap Dashboard → Analytics → Funnels**:

1. **Step 1**: `User Registered` (Signup)
2. **Step 2**: `Task Created` within 24 hours
3. **Step 3**: `Focus Session Started` within 24 hours
4. **Step 4**: `Focus Session Completed` within 2 hours of Step 3

### What to Analyze:
- **Conversion Rate**: What percentage of registered users complete their first focus session?
- **Friction Points**: Do users drop off after creating a task without starting a timer?
- **Time to Convert**: How many minutes/hours elapse between registration and the first completed focus session?

### Understanding "Real Impact" (Incrementality & Control Groups)
When you run campaigns to re-engage users who dropped off at Step 2 (`Task Created` but no `Focus Session Started`), how do you know if the campaign caused them to start a session, or if they would have done it anyway?
- **CleverTap Real Impact** measures the conversion delta between:
  - **Target Group**: Received the Web Push notification reminder.
  - **Control Group (Universal Control Group)**: A randomly held-out slice (e.g. 10%) of the segment that did *not* receive the message.
- The **Lift Percentage** indicates the true incremental value generated by your campaign.

---

## 5. Cohort Analysis

Cohorts track user retention over time by grouping users who performed an initial action in the same time frame.

### Setting up Cohorts in CleverTap:
Go to **CleverTap Dashboard → Analytics → Cohorts**:

- **First Action (Cohort Definition)**: `User Registered`
- **Return Action**: `Focus Session Completed`
- **Time Interval**: Weekly or Daily

### Learning Objective:
Observe retention decay curves:
- Do users who registered in Week 1 continue completing focus sessions in Week 2, 3, and 4?
- Segment the cohort by `Interests contains 'programming'` vs other interests to determine if developers exhibit higher retention.

---

## 6. Flows (User Pathing) Analysis

Flows visualize the sequential paths users take before or after a specific event.

### Setting up Flows in CleverTap:
Go to **CleverTap Dashboard → Analytics → Flows**:

1. Set the starting anchor to: `Dashboard Viewed`
2. Observe branching:
   - **Path A**: `Dashboard Viewed` → `Task Created` → `Focus Session Started` (Structured Planners)
   - **Path B**: `Dashboard Viewed` → `Focus Session Started` (Spontaneous Focusers)
   - **Path C**: `Dashboard Viewed` → `Progress Viewed` → Exit (Casual Observers)

### Churn Flow Analysis:
Set the anchor event to `Focus Session Abandoned` and inspect the steps that immediately preceded it (e.g. specific `Task Category` or `Duration = 60 min`).

---

## 7. Pivot Analysis

Pivots provide multi-dimensional cross-tabulation across categorical and numeric properties.

### Setting up Pivots in CleverTap:
Go to **CleverTap Dashboard → Analytics → Pivots**:

- **Event**: `Focus Session Completed`
- **Row Dimension**: `Task Category` (Work, Study, Personal)
- **Column Dimension**: `Duration (minutes)` (25, 45, 60)
- **Value Metric**: Count of Events AND Average `Elapsed Minutes`

### Insight:
Discover which task categories drive longer focus durations (e.g., does "Work" correlate with 45-minute sessions, while "Personal" correlates with 25-minute Pomodoro sessions?).

---

## 8. RFM (Recency, Frequency, Value) Analysis

CleverTap provides an automated RFM grid typically used in e-commerce. In a productivity application, FocusFlow models RFM by equating **Focus Minutes** to **Monetary Value**:

| Dimension | FocusFlow Metric | Measured In CleverTap Via |
| :--- | :--- | :--- |
| **Recency (R)** | Time since last focus session | Timestamp of latest `Focus Session Completed` or `Last Active Date` |
| **Frequency (F)** | Habit consistency | Count of `Focus Session Completed` events |
| **Value (M)** | Productivity output | Sum of `Elapsed Minutes` / `Total Focus Minutes` property |

### Target RFM Segments:
- **Champions**: High Recency (today/yesterday), High Frequency (>10 sessions), High Value (>300 focus minutes).
- **Potential Loyalists**: High Recency, Medium Frequency (3-5 sessions).
- **At-Risk**: Low Recency (>7 days ago), previously High Frequency.
- **Hibernating**: Low Recency (>14 days), Low Frequency.

### The Concept of "Bulletins"
- **What are Bulletins?**: In CleverTap, a **Bulletin** is a high-visibility, broadcast announcement message delivered across inboxes (Web Inbox and App Inbox).
- **Difference from Campaigns**: While standard campaigns are personalized or triggered by specific user actions, Bulletins are broadcast to entire audiences (e.g., "⚡ Maintenance Notice", "🎉 New 45-Minute Focus Mode Released!").
- **FocusFlow Compatibility**: FocusFlow's Web Inbox container is pre-configured to receive and render Bulletins sent from the CleverTap dashboard.

---

## 9. Lifecycle Stages & Lifecycle Optimizer

CleverTap automatically tracks user progression through 5 lifecycle stages:

```
[New User] ──► [Active User] ──► [Power User]
                     │
                     ▼
              [At-Risk User] ──► [Dormant / Churned]
                     │
                     ▼ (Win-Back Campaign)
             [Resurrected User]
```

FocusFlow updates the `Lifecycle Stage` profile property dynamically so you can inspect how segment populations shift over time in **CleverTap Dashboard → Analytics → Lifecycle**.

### Understanding "Lifecycle Optimizer"
- **CleverTap Lifecycle Optimizer** is an automated ML feature that analyzes historical migration velocities:
  - How fast do **New Users** become **Active**?
  - What is the drop-off window before an Active user slips into **At-Risk**?
- **Actionable Optimization**: It allows you to attach automated triggers directly to the transitions (e.g., the moment a user transitions from *Active* to *At-Risk*, trigger an automated re-engagement Web Push with their preferred focus duration).

---

## 10. User Segmentation Recipes

Create these segments in **CleverTap Dashboard → Segments → Create Segment**:

### 1. New Users Needing Activation
- **Criteria**: Did `User Registered` in last 3 days AND did NOT do `Focus Session Started`.
- **Target Campaign**: Welcome Push notification encouraging a first 25-minute Pomodoro.

### 2. Session Abandoners
- **Criteria**: Did `Focus Session Abandoned` in last 7 days at least 1 time.
- **Target Campaign**: In-App message: *"Distractions happen. Try a shorter 25-minute session today."*

### 3. Developer Persona
- **Criteria**: Profile property `Occupation` contains "Engineer" OR `Interests` contains "programming".
- **Target Campaign**: Personalized tip on deep work flow states for software development.

### 4. 7-Day Streak Builders
- **Criteria**: Did `Streak Achieved` with property `Streak Days = 7`.
- **Target Campaign**: In-App celebration pop-up and badge reward in the Web Inbox.

### 5. Slipping / Dormant Users
- **Criteria**: Did `Focus Session Completed` at least once in history, but NOT in the last 7 days.
- **Target Campaign**: Re-engagement Web Push: *"Your tasks are waiting for you in FocusFlow."*

---

## 11. Campaigns & Triggered Messaging

### Web Push Notifications
- **Service Worker**: Hosted at `frontend/public/clevertap_sw.js`.
- **Trigger**: The sidebar card triggers `requestWebPushPermission()`, which prompts the user with an explanation before displaying the browser notification permission prompt.
- **CleverTap Setup**: In **Settings → Channels → Web Push**, configure your VAPID keys and site URL.

### In-App Web Pop-ups & Banners
- In-App messages render overlays in the browser triggered by user actions.
- **Setup in Dashboard**: Go to **Campaigns → In-App → Create Campaign**.
- **Trigger Event**: Select `Streak Achieved` or `First Focus Session`.
- The CleverTap Web SDK automatically intercepts the event and renders the modal directly on the screen without custom frontend modal code.

### Web Inbox (App Inbox)
- FocusFlow features a persistent notification bell icon (`id="ct-inbox-button"`) in the navigation sidebar.
- Displays an unread badge via `getUnreadInboxMessageCount()`.
- Clicking the bell calls `showInbox()`, opening CleverTap's tabbed persistent notification center.

### Exit Intent Web Overlays
- FocusFlow's `ExitIntentTracker.tsx` listens for the user's cursor moving out of the top viewport boundary and triggers `Exit Intent Triggered`.
- **Dashboard Campaign**: Create an In-App Web Campaign with trigger:
  - `Action: In response to an event → Exit Intent Triggered`
  - Render an overlay: *"Before you go, log one quick 25-minute focus session!"*

---

## 12. Journeys (Automated Orchestration)

Journeys automate multi-stage communication flows.

### Recipe: "Day 1 to Day 7 User Activation Journey"
In **CleverTap Dashboard → Journeys → Create Journey**:

```
[Entry Trigger: User Registered]
        │
        ▼
   [Wait 2 Hours]
        │
        ▼
   <Check Condition: Has completed 'Focus Session Started'?>
        ├── NO  ──► [Send Web Push: "Ready for your first session? Try 25 minutes."]
        │                │
        │                ▼
        │          [Wait 24 Hours]
        │                │
        │                ▼
        │          <Check Condition: Still no session?>
        │                └── YES ──► [Send In-App Banner on Next Login]
        │
        └── YES ──► [Send Web Inbox Message: "Great start! Aim for a 3-day streak."]
                         │
                         ▼
                   [Wait 3 Days]
                         │
                         ▼
                   <Check Condition: Streak Achieved?>
                         └── YES ──► [Send In-App Celebration: "🔥 You're on fire!"]
```

---

## 13. Personalization with Liquid Templates

CleverTap supports Liquid syntax for real-time personalization in campaign copy:

### Examples for FocusFlow Campaigns:

**Personalized Push Reminder**:
```text
Title: Hey {{Profile.Name | default: "there"}}! Time to focus.
Body: You prefer {{Profile.Preferred Focus Duration | default: 25}}-minute sessions. Your {{Event.Task Category | default: "tasks"}} need your attention.
```

**Streak Milestone Message**:
```text
Title: 🔥 Incredible work, {{Profile.Name}}!
Body: You've maintained your focus streak for {{Event.Streak Days}} days in a row!
```

---

## 14. Privacy, Consent & GDPR Compliance

FocusFlow implements privacy compliance via the `Settings` page:

1. **Analytics Opt-Out**: When the user toggles "Opt Out of All Analytics Tracking", FocusFlow executes:
   ```typescript
   clevertap.privacy.push({ optOut: true });
   ```
   CleverTap immediately ceases event transmission and profile attribute updates for this client.
2. **Consent Flags**: Stored on the profile (`Data Processing Consent`, `Marketing Consent`), allowing campaigns to filter for opted-in users (`Marketing Consent = true`).

---

## 15. Verification & Live Testing

### How to Verify Events in Real-Time:

1. Open your browser Developer Tools (Console tab).
2. Look for the `[CleverTap SDK]`, `[CleverTap Profile]`, and `[CleverTap Event]` log statements emitted by FocusFlow.
3. Open the **CleverTap Dashboard → Analytics → Live View**.
4. Perform actions in FocusFlow:
   - Register a new account → Observe user profile creation.
   - Create a task → Observe `Task Created`.
   - Start and complete a focus session → Observe `Focus Session Started` & `Focus Session Completed`.
   - Update settings → Observe profile attribute updates.
5. In **CleverTap Dashboard → People → Find People**, search by your test email address to view the complete unified customer timeline.

---

## 16. Phase 3 Mastery: Architecture, Server-Side APIs & Identity Resolution

### 1. CleverTap System Architecture (LP, DB, NB, LC)

| Component | Full Name | Role in the System |
| :--- | :--- | :--- |
| **LP** | **Listener Proxy** | Ingestion gateway / edge proxy. Receives HTTP/HTTPS event and profile packets from SDKs and Server APIs, validates auth tokens, and handles traffic spikes. |
| **DB** | **Distributed Datastore** | CleverTap's proprietary high-performance, in-memory, and columnar database. Optimized for sub-second segmentation, cohort calculations, and real-time event aggregation. |
| **NB** | **Notification Bridge** | Delivery dispatch engine. Routes rendered campaign payloads to external gateways: APNS (iOS), FCM (Android), Web Push endpoints, and Email/SMS/WhatsApp service providers. |
| **LC** | **Lifecycle / Campaign Controller** | The brains of the system. Evaluates live event triggers, journey rule trees, frequency capping rules (e.g. max 1 push/day), and Do-Not-Disturb (DND) windows. |

### 2. Server-Side API Integration (User API & Event API)
FocusFlow includes a dedicated server client at [`backend/src/clevertap/serverClient.ts`](file:///Users/deepkumar/Desktop/Task2_WebApp/backend/src/clevertap/serverClient.ts).

You can push events or profiles directly from Node.js/Express to CleverTap via:
```bash
POST https://api.clevertap.com/1/upload
Headers:
  X-CleverTap-Account-Id: YOUR_ACCOUNT_ID
  X-CleverTap-Passcode: YOUR_PASSCODE
  Content-Type: application/json
Body:
{
  "d": [
    {
      "identity": "1",
      "type": "event",
      "evtName": "Focus Session Completed",
      "evtData": { "Duration (minutes)": 25, "Completed On Time": true }
    }
  ]
}
```

### 3. Identity Management Deep-Dive
- **Merge Scenario**: A user browses as an anonymous visitor (GUID: `_c78...`). They register with `Identity: "42"`. CleverTap merges the GUID record with Identity `"42"`. All prior browsing actions become part of User `"42"`'s history.
- **Multi-Device Synchronization**: User `"42"` logs in on a work laptop (Chrome) and a home desktop (Safari). Both clients invoke `onUserLogin` with `Identity: "42"`. CleverTap maps both devices to a single unified customer profile.
- **Conflict Prevention**: Never use temporary or shared keys (e.g., device IMEI or phone number if shared among families) as `Identity`. Always use immutable, database-generated primary keys (e.g. FocusFlow's `user.id`).

### 4. Dynamic Linked Content & Catalogs
FocusFlow provides live Linked Content endpoints in [`backend/src/routes/linkedContentRoutes.ts`](file:///Users/deepkumar/Desktop/Task2_WebApp/backend/src/routes/linkedContentRoutes.ts):
- `GET /api/public/linked-content/quote`: Supplies real-time productivity quotes into campaign message templates.
- `GET /api/public/linked-content/presets`: Supplies session duration presets.
CleverTap calls these endpoints at campaign render-time to fetch up-to-the-minute dynamic content.
