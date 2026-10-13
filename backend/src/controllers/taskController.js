// ============================================================================
// FILE: backend/src/controllers/taskController.js
// PURPOSE: Handles HTTP requests for creating, listing, completing, and deleting tasks.
// ============================================================================

const {
  getTasksByUserId,
  createTask,
  updateTaskById,
  markTaskCompleted,
  deleteTaskById
} = require('../models/taskModel');
const { getDefaultUser } = require('../models/userModel');

// Returns all tasks belonging to the current user from SQLite
function handleGetTasks(req, res) {
  try {
    const userId = req.query.userId || getDefaultUser()?.id || 'usr_demo_101';
    const tasks = getTasksByUserId(userId);
    return res.json({ tasks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Creates a new task in SQLite for the current user
function handleCreateTask(req, res) {
  try {
    const { userId, title, description, category, priority, estimatedMinutes, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const resolvedUserId = userId || getDefaultUser()?.id || 'usr_demo_101';
    const newTask = createTask({
      userId: resolvedUserId,
      title,
      description,
      category,
      priority,
      estimatedMinutes,
      dueDate
    });

    return res.status(201).json({
      message: 'Task saved to SQLite database',
      task: newTask
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Updates a task's details in SQLite
function handleUpdateTask(req, res) {
  try {
    const { id } = req.params;
    const updatedTask = updateTaskById(id, req.body);
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.json({ message: 'Task updated in SQLite', task: updatedTask });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Toggles a task's completion status in SQLite
function handleCompleteTask(req, res) {
  try {
    const { id } = req.params;
    const updatedTask = markTaskCompleted(id);
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.json({
      message: updatedTask.completed ? 'Task marked completed' : 'Task reopened',
      task: updatedTask
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Deletes a task from SQLite
function handleDeleteTask(req, res) {
  try {
    const { id } = req.params;
    const deleted = deleteTaskById(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.json({ message: 'Task deleted from SQLite', task: deleted });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleGetTasks,
  handleCreateTask,
  handleUpdateTask,
  handleCompleteTask,
  handleDeleteTask
};
