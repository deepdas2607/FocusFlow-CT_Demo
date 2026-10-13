// ============================================================================
// FILE: backend/src/database/sqliteDatabase.js
// PURPOSE: Real SQLite relational database connection and SQL table setup.
// Uses Node.js built-in 'node:sqlite' to store data in 'focusflow.db'.
// ============================================================================

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// Path to the actual SQLite database file on disk
const DB_FILE_PATH = path.join(__dirname, 'focusflow.db');

// Open a persistent connection to the SQLite database file
const db = new DatabaseSync(DB_FILE_PATH);

// Initializes all relational SQL tables if they do not exist yet
function initializeDatabaseTables() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    -- 1. USERS TABLE: Stores registered user accounts and profile attributes
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      dob TEXT DEFAULT '',
      occupation TEXT DEFAULT 'Software Engineer',
      focusGoal TEXT DEFAULT 'Deep Work',
      createdAt TEXT NOT NULL
    );

    -- 2. USER PREFERENCES TABLE: Stores notification and privacy settings per user
    CREATE TABLE IF NOT EXISTS user_preferences (
      userId TEXT PRIMARY KEY,
      notificationsEnabled INTEGER DEFAULT 1,
      productivityReminders INTEGER DEFAULT 1,
      sessionReminders INTEGER DEFAULT 1,
      weeklySummary INTEGER DEFAULT 1,
      marketingConsent INTEGER DEFAULT 1,
      analyticsOptOut INTEGER DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. TASKS TABLE: Stores user tasks with category, priority, and completion state
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'Work',
      priority TEXT DEFAULT 'Medium',
      estimatedMinutes INTEGER DEFAULT 25,
      dueDate TEXT DEFAULT '',
      completed INTEGER DEFAULT 0,
      completedAt TEXT DEFAULT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 4. FOCUS SESSIONS TABLE: Stores Pomodoro / focus timer sessions
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      taskId TEXT DEFAULT NULL,
      taskTitle TEXT DEFAULT 'General Focus',
      duration INTEGER NOT NULL,
      status TEXT NOT NULL,
      startedAt TEXT NOT NULL,
      completedAt TEXT DEFAULT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

// Run table initialization immediately when the server starts
initializeDatabaseTables();

module.exports = {
  db,
  DB_FILE_PATH
};

