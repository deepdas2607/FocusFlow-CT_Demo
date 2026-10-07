# FocusFlow

> A full-stack productivity web application built to learn CleverTap integration.
> Users can manage tasks, run timed focus sessions, track progress, and receive personalized engagement through CleverTap campaigns.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Installation](#4-installation)
5. [Environment Variables](#5-environment-variables)
6. [Database Setup](#6-database-setup)
7. [Running the Backend](#7-running-the-backend)
8. [Running the Frontend](#8-running-the-frontend)
9. [API Overview](#9-api-overview)
10. [Database Schema](#10-database-schema)
11. [Authentication Flow](#11-authentication-flow)
12. [CleverTap Integration](#12-clevertap-integration)
13. [CleverTap Event Catalogue](#13-clevertap-event-catalogue)
14. [CleverTap Profile Properties](#14-clevertap-profile-properties)
15. [Suggested Segments](#15-suggested-segments)
16. [Suggested Campaigns](#16-suggested-campaigns)
17. [Suggested Journey](#17-suggested-journey)
18. [Testing Instructions](#18-testing-instructions)
19. [Troubleshooting](#19-troubleshooting)

---

## 1. Project Overview

FocusFlow is a simple but complete full-stack web application that demonstrates:

- REST API development with Node.js and Express
- PostgreSQL database integration using Prisma ORM
- JWT-based authentication
- React/Next.js frontend with TypeScript
- Complete CleverTap Web SDK integration

The application lets users:
- Create and manage tasks with categories and priorities
- Start timed focus sessions (25, 45, or 60 minutes)
- Pause, resume, complete, or abandon sessions
- View productivity statistics and streaks
- Update their profile and notification preferences

Every meaningful user action fires a CleverTap event with relevant properties.

---

## 2. Architecture

```
Task2_WebApp/
├── frontend/          # Next.js 14 app (React, TypeScript, Tailwind CSS)
│   └── src/
│       ├── app/       # Pages (Next.js App Router)
│       ├── components/ # Reusable UI components
│       ├── contexts/  # React context (auth state)
│       └── lib/
│           ├── api.ts          # All backend API calls
│           └── clevertap/
│               ├── events.ts   # Event name constants
│               └── client.ts   # CleverTap SDK helper functions
│
└── backend/           # Express.js API server (TypeScript)
    └── src/
        ├── controllers/  # Route handler functions
        ├── routes/       # Express route definitions
        ├── middleware/   # JWT auth middleware
        └── prisma/       # Prisma schema and client
```

**Data flow:**
```
Browser (Next.js) → HTTP Request → Express API → Prisma → PostgreSQL
                  ← JSON Response ←            ←        ←

Browser (Next.js) → CleverTap Web SDK → CleverTap Cloud (directly from browser)
```

> CleverTap tracking happens entirely in the browser. No CleverTap calls go through your Express backend.

---

## 3. Prerequisites

- **Node.js** 18 or later
- **npm** 8 or later
- **PostgreSQL** 14 or later (running locally or a managed database)
- A **CleverTap account** (free tier is sufficient for learning)

---

## 4. Installation

### Clone or navigate to the project

```bash
cd /path/to/Task2_WebApp
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Install frontend dependencies

```bash
cd frontend
npm install
```

---

## 5. Environment Variables

### Backend (`backend/.env`)

Copy the example file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

| Variable       | Description                              | Example                                      |
|----------------|------------------------------------------|----------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string             | `postgresql://postgres:pass@localhost:5432/focusflow` |
| `JWT_SECRET`   | Secret key for signing JWT tokens        | A long random string                         |
| `PORT`         | Port for the Express server              | `4000`                                       |
| `FRONTEND_URL` | Frontend URL for CORS                    | `http://localhost:3000`                      |

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (`frontend/.env.local`)

Copy the example file:
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:

| Variable                           | Description                    | Example      |
|------------------------------------|--------------------------------|--------------|
| `NEXT_PUBLIC_API_URL`              | Backend server URL             | `http://localhost:4000` |
| `NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID` | Your CleverTap Account ID      | `ABC-XXX-XXXX` |
| `NEXT_PUBLIC_CLEVERTAP_REGION`     | Your CleverTap region code     | `in1`        |

Get your CleverTap credentials:
1. Log into [CleverTap Dashboard](https://dashboard.clevertap.com)
2. Go to **Settings → Project Settings**
3. Copy your **Account ID** and note your **Region**

---

## 6. Database Setup

FocusFlow offers two ways to run PostgreSQL:

### Option A: Zero-Config Embedded PostgreSQL (Recommended for quick start)
You don't need to install or configure PostgreSQL or Docker. An embedded PostgreSQL instance is included in the project:

```bash
cd backend
npm run db:local    # Starts embedded PostgreSQL on localhost:5432
```
In a new terminal:
```bash
cd backend
npm run db:push     # Synchronizes Prisma models to the database
```

### Option B: Local or Hosted PostgreSQL (Production / Docker / Supabase / Neon)
If you already have PostgreSQL installed or a cloud PostgreSQL instance:

1. Create your database:
   ```bash
   psql -U postgres
   CREATE DATABASE focusflow;
   \q
   ```
2. Update `DATABASE_URL` in `backend/.env` with your connection string.
3. Apply schema:
   ```bash
   cd backend
   npm run db:push
   ```

### Inspect your database in the browser (optional)
```bash
npm run db:studio
```
Opens Prisma Studio on `http://localhost:5555` to view users, tasks, and focus sessions.

---

## 7. Running the Backend

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:4000`.

You should see:
```
FocusFlow backend running on http://localhost:4000
Environment: development
```

Test it: open `http://localhost:4000/health` in your browser. You should see `{"status":"ok"}`.

---

## 8. Running the Frontend

```bash
cd frontend
npm run dev
```

The app will start on `http://localhost:3000`.

---

## 9. API Overview

### Authentication

| Method | Endpoint             | Description              | Auth Required |
|--------|----------------------|--------------------------|---------------|
| POST   | `/api/auth/register` | Create a new account     | No            |
| POST   | `/api/auth/login`    | Login and get JWT        | No            |
| GET    | `/api/auth/me`       | Get current user data    | Yes           |

### Tasks

| Method | Endpoint                  | Description         | Auth Required |
|--------|---------------------------|---------------------|---------------|
| GET    | `/api/tasks`              | Get all tasks       | Yes           |
| POST   | `/api/tasks`              | Create a task       | Yes           |
| PUT    | `/api/tasks/:id`          | Update a task       | Yes           |
| DELETE | `/api/tasks/:id`          | Delete a task       | Yes           |
| POST   | `/api/tasks/:id/complete` | Complete a task     | Yes           |

### Focus Sessions

| Method | Endpoint                      | Description              | Auth Required |
|--------|-------------------------------|--------------------------|---------------|
| POST   | `/api/focus/start`            | Start a focus session    | Yes           |
| POST   | `/api/focus/:id/complete`     | Complete a session       | Yes           |
| POST   | `/api/focus/:id/abandon`      | Abandon a session        | Yes           |
| GET    | `/api/focus/history`          | Get session history      | Yes           |

### Profile & Dashboard

| Method | Endpoint          | Description            | Auth Required |
|--------|-------------------|------------------------|---------------|
| GET    | `/api/profile`    | Get user profile       | Yes           |
| PUT    | `/api/profile`    | Update user profile    | Yes           |
| GET    | `/api/dashboard`  | Get dashboard stats    | Yes           |

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 10. Database Schema

### User
Stores account credentials and profile info. `passwordHash` stores the bcrypt-hashed password (never the plain text). `occupation` and `interests` are synced to CleverTap as profile properties.

### Task
Stores tasks belonging to a user. `category` and `priority` are sent as event properties to CleverTap.

### FocusSession
Records each focus session attempt. `status` can be `STARTED`, `COMPLETED`, or `ABANDONED`. Used to calculate streaks and total focus time.

### UserPreferences
Stores notification opt-in/out preferences. These are stored in CleverTap profile and used for campaign filtering.

---

## 11. Authentication Flow

1. **Register**: User submits name/email/password → backend hashes password with bcrypt → creates user record → returns JWT.
2. **Login**: User submits email/password → backend finds user → compares password with bcrypt → returns JWT.
3. **Session restoration**: On page load, frontend reads JWT from localStorage → calls `GET /api/auth/me` → if valid, user is logged in.
4. **Protected routes**: Every protected API call includes `Authorization: Bearer <token>` → backend middleware verifies token → extracts userId → passes to route handler.
5. **Logout**: Frontend removes JWT from localStorage → user is redirected to login.

---

## 12. CleverTap Integration

See [`CLEVERTAP.md`](./CLEVERTAP.md) for a detailed beginner-friendly explanation.

### Quick overview

CleverTap integration lives in two files:
- `frontend/src/lib/clevertap/events.ts` — all event name constants
- `frontend/src/lib/clevertap/client.ts` — all helper functions

**Initialization**: `CleverTapProvider` component initializes the SDK once when the app loads.

**User identification**: After login/register, `identifyUser()` is called with the user's data. This creates/updates their CleverTap profile.

**Event tracking**: Every major user action calls a specific helper function (e.g., `trackTaskCreated()`, `trackFocusSessionCompleted()`).

---

## 13. CleverTap Event Catalogue

| Event Name                | When it fires                                     | Key Properties                                  |
|---------------------------|---------------------------------------------------|-------------------------------------------------|
| `User Registered`         | After successful registration                     | —                                               |
| `User Logged In`          | After successful login                            | —                                               |
| `User Logged Out`         | When user clicks logout                           | —                                               |
| `Dashboard Viewed`        | When user visits dashboard                        | —                                               |
| `Progress Viewed`         | When user visits progress page                    | —                                               |
| `Profile Viewed`          | When user visits settings page                    | —                                               |
| `Settings Updated`        | When user saves settings                          | —                                               |
| `Task Created`            | When user creates a task                          | Category, Priority                              |
| `Task Viewed`             | When user views task details                      | Category, Priority                              |
| `Task Updated`            | When user edits a task                            | Category, Priority                              |
| `Task Completed`          | When user marks a task done                       | Category, Priority, Time Taken (minutes)        |
| `Task Deleted`            | When user deletes a task                          | Category, Priority                              |
| `Focus Session Started`   | When user starts a focus session                  | Duration (minutes), Task Category               |
| `Focus Session Paused`    | When user pauses a session                        | —                                               |
| `Focus Session Resumed`   | When user resumes a session                       | —                                               |
| `Focus Session Completed` | When user completes a session                     | Duration, Task Category, Completed On Time, Elapsed Minutes |
| `Focus Session Abandoned` | When user abandons a session                      | Duration, Elapsed Minutes, Task Category, Completion Percentage |
| `First Focus Session`     | Only the very first session ever                  | —                                               |
| `First Task Completed`    | Only the very first task completion               | —                                               |
| `Streak Achieved`         | When streak hits 7, 14, or 30 days                | Streak Days                                     |

---

## 14. CleverTap Profile Properties

| Property Name               | Type    | Description                                       |
|-----------------------------|---------|---------------------------------------------------|
| `Name`                      | String  | User's full name (standard CleverTap field)       |
| `Email`                     | String  | User's email (standard CleverTap field)           |
| `Identity`                  | String  | Database user ID (unique identifier)              |
| `Occupation`                | String  | User's occupation (set in Settings)               |
| `Interests`                 | String  | Comma-separated interests (set in Settings)       |
| `Preferred Focus Duration`  | Number  | Default session length in minutes                 |
| `Notifications Enabled`     | Boolean | Whether the user wants notifications              |

---

## 15. Suggested Segments

Create these in CleverTap Dashboard → **Segments**:

| Segment Name                        | Criteria                                              |
|-------------------------------------|-------------------------------------------------------|
| New Users (No Session)              | `User Registered` done, `Focus Session Started` = 0  |
| Abandoned Session Users             | `Focus Session Abandoned` done in last 7 days         |
| 7-Day Streak Achievers              | `Streak Achieved` where Streak Days = 7               |
| Inactive Users                      | Last seen > 5 days ago                               |
| Programming Enthusiasts             | Profile `Interests` contains "programming"            |
| Power Users                         | `Focus Session Completed` > 10 times                 |

---

## 16. Suggested Campaigns

| Campaign                     | Target Segment              | Channel       | Message                                                                 |
|------------------------------|-----------------------------|---------------|-------------------------------------------------------------------------|
| Welcome Message              | All new registrations       | In-App / Push | "Welcome to FocusFlow! Create your first task to get started."         |
| Activation Nudge             | New Users (No Session)      | Push          | "You haven't tried a focus session yet. Give 25 minutes a try!"        |
| Abandoned Session Re-engage  | Abandoned Session Users     | In-App        | "Tough session? That's okay - try again when you're ready."            |
| Streak Celebration           | 7-Day Streak Achievers      | In-App        | "🔥 7-day streak! You're building a real habit. Keep going!"          |
| Win-Back Inactive Users      | Inactive Users              | Push          | "We miss you! You have {{tasks}} tasks waiting."                       |
| Interest-Based Tips          | Programming Enthusiasts     | In-App        | "Coding deep work tip: try 45-minute sessions for complex problems."   |

---

## 17. Suggested Journey

**Journey: New User Activation**

```
[User Registered]
       ↓ Wait 1 hour
[Has user started a Focus Session?]
  No  → Send in-app: "Ready to try your first focus session?"
  Yes → Send in-app: "Great first session! Did you know streaks unlock milestones?"
       ↓ Wait 3 days
[Has user completed 3+ sessions?]
  No  → Send push: "Even 25 minutes of focus makes a difference. Try today!"
  Yes → Send in-app: "You're on a roll! Update your interests for personalized tips."
```

Set this up in CleverTap → **Journeys → Create Journey**.

---

## 18. Testing Instructions

### Manual test flow

1. Open `http://localhost:3000`
2. Click **Get Started** → Fill in the registration form
3. You should be redirected to the Dashboard
4. Open your CleverTap dashboard → Live User View to see the user appear
5. Click **Tasks** → Create a task (category: Work, priority: High)
6. Check CleverTap events: you should see `Task Created` with Category=Work, Priority=High
7. Click **Focus** → Select your task → Choose 25 minutes → Start Session
8. Check CleverTap: `Focus Session Started` should appear
9. After a few seconds, click **Complete**
10. Check CleverTap: `Focus Session Completed` with Completed On Time, Elapsed Minutes
11. Go back to Tasks → Mark your task as complete
12. Check CleverTap: `Task Completed` with Time Taken
13. Go to **Settings** → Add Occupation and Interests → Save
14. Check CleverTap profile: Occupation and Interests should be updated

### CleverTap Live View

Go to: **CleverTap Dashboard → Live View** — you can see events firing in real time as you use the app.

---

## 19. Troubleshooting

**Backend won't start: "JWT_SECRET is not defined"**
→ Make sure `backend/.env` exists and has `JWT_SECRET` set.

**"DATABASE_URL is not defined" or Prisma errors**
→ Check `backend/.env` has `DATABASE_URL`. Make sure PostgreSQL is running.

**Login returns "Invalid email or password" after register**
→ Check that `bcryptjs` is installed: `cd backend && npm install`.

**CleverTap events not showing up in dashboard**
→ Check browser console for `[CleverTap]` log messages. Make sure `NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID` is set in `frontend/.env.local`. Check for ad blockers.

**CORS errors**
→ Make sure `FRONTEND_URL` in `backend/.env` matches where your frontend is running (e.g., `http://localhost:3000`).

**"Cannot find module 'clevertap-web-sdk'"**
→ Run `cd frontend && npm install clevertap-web-sdk` in the frontend directory.

**Prisma "Table doesn't exist" errors**
→ Run `cd backend && npm run db:migrate`.

