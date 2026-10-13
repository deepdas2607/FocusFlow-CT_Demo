// ============================================================================
// FILE: backend/src/models/userModel.js
// PURPOSE: Executes SQL queries for user authentication, profile, and preferences.
// ============================================================================

const { db } = require('../database/sqliteDatabase');

// Converts raw SQLite integer flags (0/1) into clean boolean preferences for the frontend
function formatUserWithPreferences(userRow, prefRow) {
  if (!userRow) return null;
  const { password, ...safeUser } = userRow;
  return {
    ...safeUser,
    preferences: prefRow
      ? {
          notificationsEnabled: Boolean(prefRow.notificationsEnabled),
          productivityReminders: Boolean(prefRow.productivityReminders),
          sessionReminders: Boolean(prefRow.sessionReminders),
          weeklySummary: Boolean(prefRow.weeklySummary),
          marketingConsent: Boolean(prefRow.marketingConsent),
          analyticsOptOut: Boolean(prefRow.analyticsOptOut)
        }
      : {
          notificationsEnabled: true,
          productivityReminders: true,
          sessionReminders: true,
          weeklySummary: true,
          marketingConsent: true,
          analyticsOptOut: false
        }
  };
}

// Finds a user by email address (used during Login and Registration checks)
function findUserByEmail(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  return db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(normalizedEmail) || null;
}

// Finds a user and their notification/privacy preferences by user ID
function findUserById(userId) {
  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!userRow) return null;
  const prefRow = db.prepare('SELECT * FROM user_preferences WHERE userId = ?').get(userId);
  return formatUserWithPreferences(userRow, prefRow);
}

// Returns the most recently created user (helpful as a fallback in testing mode)
function getDefaultUser() {
  const userRow = db.prepare('SELECT * FROM users ORDER BY createdAt DESC LIMIT 1').get();
  if (!userRow) return null;
  return findUserById(userRow.id);
}

// Creates a new user row and default preferences row in SQLite
function createUser(userData) {
  const id = userData.id || `usr_${Date.now()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password, phone, dob, occupation, focusGoal, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userData.name.trim(),
    userData.email.trim().toLowerCase(),
    userData.password || 'focusflow123',
    userData.phone || '',
    userData.dob || '1999-07-26',
    userData.occupation || 'Software Engineer',
    userData.focusGoal || 'Deep Work',
    createdAt
  );

  db.prepare(`
    INSERT INTO user_preferences (userId, notificationsEnabled, productivityReminders, sessionReminders, weeklySummary, marketingConsent, analyticsOptOut)
    VALUES (?, 1, 1, 1, 1, 1, 0)
  `).run(id);

  return findUserById(id);
}

// Updates a user's profile attributes and notification/privacy preferences in SQLite
function updateUserProfileAndPreferences(userId, updateData) {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!existing) return null;

  db.prepare(`
    UPDATE users
    SET name = ?, email = ?, phone = ?, dob = ?, occupation = ?, focusGoal = ?
    WHERE id = ?
  `).run(
    updateData.name !== undefined ? updateData.name : existing.name,
    updateData.email !== undefined ? updateData.email.trim().toLowerCase() : existing.email,
    updateData.phone !== undefined ? updateData.phone : existing.phone,
    updateData.dob !== undefined ? updateData.dob : existing.dob,
    updateData.occupation !== undefined ? updateData.occupation : existing.occupation,
    updateData.focusGoal !== undefined ? updateData.focusGoal : existing.focusGoal,
    userId
  );

  if (updateData.preferences) {
    const p = updateData.preferences;
    const currentPref = db.prepare('SELECT * FROM user_preferences WHERE userId = ?').get(userId) || {};
    db.prepare(`
      INSERT INTO user_preferences (userId, notificationsEnabled, productivityReminders, sessionReminders, weeklySummary, marketingConsent, analyticsOptOut)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET
        notificationsEnabled = excluded.notificationsEnabled,
        productivityReminders = excluded.productivityReminders,
        sessionReminders = excluded.sessionReminders,
        weeklySummary = excluded.weeklySummary,
        marketingConsent = excluded.marketingConsent,
        analyticsOptOut = excluded.analyticsOptOut
    `).run(
      userId,
      p.notificationsEnabled !== undefined ? (p.notificationsEnabled ? 1 : 0) : (currentPref.notificationsEnabled ?? 1),
      p.productivityReminders !== undefined ? (p.productivityReminders ? 1 : 0) : (currentPref.productivityReminders ?? 1),
      p.sessionReminders !== undefined ? (p.sessionReminders ? 1 : 0) : (currentPref.sessionReminders ?? 1),
      p.weeklySummary !== undefined ? (p.weeklySummary ? 1 : 0) : (currentPref.weeklySummary ?? 1),
      p.marketingConsent !== undefined ? (p.marketingConsent ? 1 : 0) : (currentPref.marketingConsent ?? 1),
      p.analyticsOptOut !== undefined ? (p.analyticsOptOut ? 1 : 0) : (currentPref.analyticsOptOut ?? 0)
    );
  }

  return findUserById(userId);
}

// Seeds a default demo user if the SQLite database is completely empty
function ensureDemoUserExists() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (countRow.count === 0) {
    createUser({
      id: 'usr_demo_101',
      name: 'Deepkumar Das',
      email: 'deep@focusflow.app',
      password: 'password123',
      phone: '+919876543210',
      dob: '1999-07-26',
      occupation: 'Customer Success Engineer',
      focusGoal: 'Deep Work'
    });
  }
}

ensureDemoUserExists();

module.exports = {
  findUserByEmail,
  findUserById,
  getDefaultUser,
  createUser,
  updateUserProfileAndPreferences
};
