// ============================================================================
// FILE: backend/src/models/focusSessionModel.js
// PURPOSE: Executes SQL queries on 'focus_sessions' and computes dashboard metrics.
// ============================================================================

const { db } = require('../database/sqliteDatabase');
const { getTasksByUserId } = require('./taskModel');

// Returns all focus timer sessions for a specific user ordered by newest first
function getSessionsByUserId(userId) {
  return db
    .prepare('SELECT * FROM focus_sessions WHERE userId = ? ORDER BY startedAt DESC')
    .all(userId);
}

// Inserts a new STARTED focus session into the SQLite 'focus_sessions' table
function startFocusSession(sessionData) {
  const id = `ses_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const startedAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO focus_sessions (id, userId, taskId, taskTitle, duration, status, startedAt, completedAt)
    VALUES (?, ?, ?, ?, ?, 'STARTED', ?, NULL)
  `).run(
    id,
    sessionData.userId,
    sessionData.taskId || null,
    sessionData.taskTitle || 'Deep Work Focus Session',
    Number(sessionData.duration) || 25,
    startedAt
  );

  return db.prepare('SELECT * FROM focus_sessions WHERE id = ?').get(id);
}

// Updates a focus session status to COMPLETED or ABANDONED in SQLite
function finishFocusSession(sessionId, finalStatus) {
  const existing = db.prepare('SELECT * FROM focus_sessions WHERE id = ?').get(sessionId);
  if (!existing) return null;

  const completedAt = new Date().toISOString();
  db.prepare(`
    UPDATE focus_sessions
    SET status = ?, completedAt = ?
    WHERE id = ?
  `).run(finalStatus, completedAt, sessionId);

  return db.prepare('SELECT * FROM focus_sessions WHERE id = ?').get(sessionId);
}

// Computes aggregated productivity metrics for the Dashboard and Progress views
function getDashboardMetricsForUser(userId) {
  const userTasks = getTasksByUserId(userId);
  const userSessions = getSessionsByUserId(userId);
  const todayPrefix = new Date().toISOString().split('T')[0];

  const completedTasks = userTasks.filter((t) => t.completed);
  const tasksCompletedToday = completedTasks.filter(
    (t) => t.completedAt && t.completedAt.startsWith(todayPrefix)
  ).length;

  const completedSessions = userSessions.filter((s) => s.status === 'COMPLETED');
  const totalFocusMinutes = completedSessions.reduce(
    (sum, s) => sum + (Number(s.duration) || 0),
    0
  );

  // Calculate consecutive day streak from completed focus sessions or tasks
  const activeDates = new Set();
  completedSessions.forEach((s) => {
    if (s.completedAt) activeDates.add(s.completedAt.split('T')[0]);
  });
  completedTasks.forEach((t) => {
    if (t.completedAt) activeDates.add(t.completedAt.split('T')[0]);
  });

  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    if (activeDates.has(dateKey)) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  return {
    tasksCompletedToday,
    totalTasksCompleted: completedTasks.length,
    totalTasksCount: userTasks.length,
    totalFocusSessionsCompleted: completedSessions.length,
    totalFocusMinutes,
    currentStreak,
    todaysTasks: userTasks,
    recentSessions: userSessions.slice(0, 15)
  };
}

// Seeds two sample focus sessions for Elena Vance if the table is empty
function ensureDemoSessionsExist() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM focus_sessions').get();
  if (countRow.count === 0) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const today = now.toISOString();

    db.prepare(`
      INSERT INTO focus_sessions (id, userId, taskId, taskTitle, duration, status, startedAt, completedAt)
      VALUES (?, ?, NULL, ?, ?, 'COMPLETED', ?, ?)
    `).run(
      'ses_demo_1',
      'usr_elena_vance',
      'Review CleverTap Web SDK Quickstart Docs',
      25,
      yesterday,
      yesterday
    );

    db.prepare(`
      INSERT INTO focus_sessions (id, userId, taskId, taskTitle, duration, status, startedAt, completedAt)
      VALUES (?, ?, NULL, ?, ?, 'COMPLETED', ?, ?)
    `).run(
      'ses_demo_2',
      'usr_elena_vance',
      'Initialize CleverTap Web SDK & SQLite Database',
      45,
      today,
      today
    );
  }
}

ensureDemoSessionsExist();

module.exports = {
  getSessionsByUserId,
  startFocusSession,
  finishFocusSession,
  getDashboardMetricsForUser
};
