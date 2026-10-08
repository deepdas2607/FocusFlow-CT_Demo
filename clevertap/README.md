# Standalone CleverTap Integration Module

This directory contains the **standalone, reusable CleverTap integration module** designed for **FocusFlow**.

---

## 1. What This Folder Is

This module houses all CleverTap telemetry, SDK wrappers, event catalogues, user profile schemas, identity resolution mechanisms, web channels (Push, Inbox, Pop-ups), and server-side REST API clients built during the **P1, P2, and P3** phases.

---

## 2. Current Status: Prepared But Disconnected

> [!IMPORTANT]
> **This module is currently NOT connected to or imported by the FocusFlow application.**
> The core FocusFlow application (`frontend/`, `backend/`, and PostgreSQL database) runs 100% independently without any CleverTap dependencies or external tracking calls.

---

## 3. Directory Structure

```text
clevertap/
├── README.md                              # Master integration & reconnection manual
├── package.json                           # Standalone package metadata & dependency specification
├── .env.example                           # Documented credentials template
├── CleverTap_FocusFlow_Postman_Collection.json # Day 13 Pre-built Postman Collection (APIs & Linked Content)
│
├── catalog/                               # Day 14 Catalog & CSV Upload
│   └── focusflow_presets_catalog.csv      # Ready-to-upload Focus Session Templates catalog
│
├── web/                                   # Client-side Web SDK v3 Integration
│   ├── client.ts                          # Web SDK initialization & safe window accessor
│   ├── config.ts                          # Account ID, Region, and runtime configuration
│   ├── events.ts                          # Full 20-event canonical registry & strongly-typed schemas
│   ├── profile.ts                         # Profile schema & profile.push updates
│   ├── identity.ts                        # Identity resolution & onUserLogin handler
│   ├── push.ts                            # Web Push soft prompt & permission subscription
│   ├── inbox.ts                           # Web Inbox initialization, unread counter & display modal
│   ├── popup.ts                           # In-App Pop-up triggers & native desktop Exit Intent listener
│   ├── consent.ts                         # GDPR/CCPA tracking opt-out & IP suppression (privacy.push)
│   ├── CleverTapProvider.tsx              # Reusable client component wrapper for Next.js root layout
│   └── clevertap_sw.js                    # Official CleverTap Web Push service worker
│
└── backend/                               # Server-side REST API Integration (/1/upload)
    ├── client.ts                          # Core HTTP client with batching & HMAC/passcode auth
    ├── userApi.ts                         # Server-to-server User Profile upload & demographic sync
    ├── eventApi.ts                        # Server-to-server Event Ingestion API
    ├── campaignApi.ts                     # Transactional Push dispatch & Dynamic Linked Content spec
    └── reportApi.ts                       # Server-to-server raw data export & audience profile query spec
```

---

## 4. What It Contains

### A. Web SDK (v3) Integration
- **Zero SSR Crashes**: Wrapped safely for Next.js App Router; only initializes in browser contexts (`typeof window !== 'undefined'`).
- **Data Resiliency Policy (DRP) Compliant**: All event properties are flat, strongly-typed scalar types (`string`, `number`, `boolean`).

### B. User Identity Resolution
- Uses FocusFlow's database User ID as the stable, immutable `Identity`.
- Merges pre-login anonymous visitor cookies (GUIDs) into the identified profile upon login via `clevertap.onUserLogin`.
- Multi-device synchronization across browsers.

### C. 20-Event Canonical Catalogue
- **Authentication**: `User Registered`, `User Logged In`, `User Logged Out`.
- **Application**: `App Launched`, `Dashboard Viewed`, `Progress Viewed`, `Profile Viewed`, `Settings Updated`.
- **Tasks**: `Task Created`, `Task Viewed`, `Task Updated`, `Task Completed`, `Task Deleted`.
- **Focus Sessions**: `Focus Session Started`, `Focus Session Paused`, `Focus Session Resumed`, `Focus Session Completed`, `Focus Session Abandoned`.
- **Milestones**: `First Focus Session`, `First Task Completed`, `Daily Goal Completed`, `Streak Achieved`.
- **Engagement**: `Exit Intent Triggered`, `Web Push Opt-In Shown`, `Web Push Subscribed`, `Web Push Dismissed`, `Web Inbox Opened`, `Consent Updated`.

### D. Web Channels
- **Web Push**: Custom branded two-step soft-prompt modal + root service worker (`/clevertap_sw.js`).
- **Web Inbox**: Element ID binding (`id="ct-inbox-button"`) with real-time unread badge counter.
- **Web Pop-ups & Exit Intent**: Desktop mouseleave detection triggering in-app overlays.
- **Privacy & Consent**: Interactive GDPR opt-out toggle executing `clevertap.privacy.push({ optOut: true })`.

### E. Backend Server REST APIs (`/1/upload`)
- Authenticated HTTP requests using `X-CleverTap-Account-Id` and `X-CleverTap-Passcode`.
- Supports regional endpoints (`in1`, `eu1`, `us1`, `sg1`).
- Dynamic Linked Content endpoints:
  - `GET /api/public/linked-content/quote`
  - `GET /api/public/linked-content/presets`

---

## 5. How to Reconnect to FocusFlow (When Approved)

When your manager approves connecting CleverTap, follow these simple reconnection steps:

### Step 1: Install Dependency
In `frontend/`:
```bash
npm install clevertap-web-sdk --save
```

### Step 2: Copy Service Worker
Copy `clevertap/web/clevertap_sw.js` into `frontend/public/clevertap_sw.js`.

### Step 3: Add Provider to Layout
In `frontend/src/app/layout.tsx`:
```tsx
import CleverTapProvider from '../../../clevertap/web/CleverTapProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CleverTapProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CleverTapProvider>
      </body>
    </html>
  );
}
```

### Step 4: Wire Desired Future Integration Points

#### Authentication (`frontend/src/contexts/AuthContext.tsx`):
```text
User Logs In
     ↓
FocusFlow Auth Context (success)
     ↓
[Integration Point]: identifyUser(userProfile) & trackEvent('User Logged In')
```

#### Task Creation (`frontend/src/app/tasks/page.tsx`):
```text
User creates task
     ↓
POST /api/tasks (Database saves task)
     ↓
[Integration Point]: trackTaskCreated({ category, priority, taskTitleLength })
```

#### Focus Session Timer (`frontend/src/app/focus/page.tsx`):
```text
Focus timer completes
     ↓
POST /api/focus/:id/complete (Database updates record)
     ↓
[Integration Point]: trackFocusSessionCompleted({ duration, taskCategory, completedOnTime, elapsedMinutes })
```

#### Profile Settings (`frontend/src/app/settings/page.tsx`):
```text
User updates profile preferences
     ↓
PUT /api/profile (Database updates record)
     ↓
[Integration Point]: updateUserProfile(changedAttributes)
```

---

## 6. Environment Credentials

Copy `.env.example` values into your project `.env` files once your CleverTap dashboard account is active:

```env
# frontend/.env.local
NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID=YOUR_ACCOUNT_ID
NEXT_PUBLIC_CLEVERTAP_REGION=in1

# backend/.env
CLEVERTAP_ACCOUNT_ID=YOUR_ACCOUNT_ID
CLEVERTAP_PASSCODE=YOUR_PASSCODE
CLEVERTAP_REGION=in1
```

