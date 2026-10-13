// ============================================================================
// FILE: backend/src/controllers/focusSessionController.js
// PURPOSE: Handles HTTP requests for focus timer sessions and dashboard analytics.
// ============================================================================

const {
  getSessionsByUserId,
  startFocusSession,
  finishFocusSession,
  getDashboardMetricsForUser
} = require('../models/focusSessionModel');
const { getDefaultUser } = require('../models/userModel');

// Returns all focus sessions for the current user from SQLite
function handleGetSessions(req, res) {
  try {
    const userId = req.query.userId || getDefaultUser()?.id || 'usr_demo_101';
    const sessions = getSessionsByUserId(userId);
    return res.json({ sessions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Starts a new focus timer session in SQLite
function handleStartSession(req, res) {
  try {
    const { userId, taskId, taskTitle, duration } = req.body;
    const resolvedUserId = userId || getDefaultUser()?.id || 'usr_demo_101';

    const session = startFocusSession({
      userId: resolvedUserId,
      taskId,
      taskTitle,
      duration
    });

    return res.status(201).json({
      message: 'Focus session started in SQLite',
      session
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Marks an active focus session as COMPLETED or ABANDONED in SQLite
function handleFinishSession(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'COMPLETED' or 'ABANDONED'
    const finalStatus = status === 'ABANDONED' ? 'ABANDONED' : 'COMPLETED';

    const updatedSession = finishFocusSession(id, finalStatus);
    if (!updatedSession) {
      return res.status(404).json({ error: 'Focus session not found' });
    }

    return res.json({
      message: `Focus session marked as ${finalStatus}`,
      session: updatedSession
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Returns aggregated productivity stats, today's tasks, and recent sessions for the user
function handleGetDashboardStats(req, res) {
  try {
    const userId = req.query.userId || getDefaultUser()?.id || 'usr_demo_101';
    const dashboard = getDashboardMetricsForUser(userId);
    return res.json({ dashboard });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleGetSessions,
  handleStartSession,
  handleFinishSession,
  handleGetDashboardStats
};
