// ============================================================================
// FILE: backend/src/models/taskModel.js
// PURPOSE: Executes SQL queries on the 'tasks' table in SQLite.
// ============================================================================

const { db } = require('../database/sqliteDatabase');

// Converts a SQLite task row (where completed is 0/1) into a clean JavaScript object
function formatTaskRow(row) {
  if (!row) return null;
  return {
    ...row,
    completed: Boolean(row.completed)
  };
}

// Returns all tasks for a specific user ordered by newest first
function getTasksByUserId(userId) {
  const rows = db
    .prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC')
    .all(userId);
  return rows.map(formatTaskRow);
}

// Finds a single task by its ID
function getTaskById(taskId) {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  return formatTaskRow(row);
}

// Inserts a new task row into the SQLite 'tasks' table
function createTask(taskData) {
  const id = `tsk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO tasks (id, userId, title, description, category, priority, estimatedMinutes, dueDate, completed, completedAt, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?)
  `).run(
    id,
    taskData.userId,
    taskData.title.trim(),
    taskData.description || '',
    taskData.category || 'Work',
    taskData.priority || 'Medium',
    Number(taskData.estimatedMinutes) || 25,
    taskData.dueDate || new Date().toISOString().split('T')[0],
    createdAt
  );

  return getTaskById(id);
}

// Updates an existing task's title, description, category, priority, or due date
function updateTaskById(taskId, updates) {
  const existing = getTaskById(taskId);
  if (!existing) return null;

  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, category = ?, priority = ?, estimatedMinutes = ?, dueDate = ?
    WHERE id = ?
  `).run(
    updates.title !== undefined ? updates.title : existing.title,
    updates.description !== undefined ? updates.description : existing.description,
    updates.category !== undefined ? updates.category : existing.category,
    updates.priority !== undefined ? updates.priority : existing.priority,
    updates.estimatedMinutes !== undefined ? Number(updates.estimatedMinutes) : existing.estimatedMinutes,
    updates.dueDate !== undefined ? updates.dueDate : existing.dueDate,
    taskId
  );

  return getTaskById(taskId);
}

// Marks a task as completed (or toggles completion) and records the timestamp
function markTaskCompleted(taskId) {
  const existing = getTaskById(taskId);
  if (!existing) return null;

  const newCompleted = existing.completed ? 0 : 1;
  const completedAt = newCompleted ? new Date().toISOString() : null;

  db.prepare('UPDATE tasks SET completed = ?, completedAt = ? WHERE id = ?').run(
    newCompleted,
    completedAt,
    taskId
  );

  return getTaskById(taskId);
}

// Deletes a task from the SQLite database by ID
function deleteTaskById(taskId) {
  const existing = getTaskById(taskId);
  if (!existing) return null;
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  return existing;
}

// Seeds initial sample tasks for the demo user if the tasks table is empty
function ensureDemoTasksExist() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
  if (countRow.count === 0) {
    createTask({
      userId: 'usr_demo_101',
      title: 'Initialize CleverTap Web SDK & Verify Account ID',
      description: 'Configure clevertap.init() and inspect network payload to wizrocket.',
      category: 'Work',
      priority: 'High',
      estimatedMinutes: 25
    });
    createTask({
      userId: 'usr_demo_101',
      title: 'Test onUserLogin vs profile.push Identity Merging',
      description: 'Verify how Identity, Email, and Phone behave across anonymous and known sessions.',
      category: 'Learning',
      priority: 'High',
      estimatedMinutes: 45
    });
    createTask({
      userId: 'usr_demo_101',
      title: 'Complete Daily 25m Deep Work Pomodoro',
      description: 'Run a focus timer session and inspect the Focus Session Completed event payload.',
      category: 'Personal',
      priority: 'Medium',
      estimatedMinutes: 25
    });
  }
}

ensureDemoTasksExist();

module.exports = {
  getTasksByUserId,
  getTaskById,
  createTask,
  updateTaskById,
  markTaskCompleted,
  deleteTaskById
};
