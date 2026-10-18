// ============================================================================
// FILE: backend/src/routes/apiRoutes.js
// PURPOSE: Connects REST API URL endpoints to their matching Controller functions.
// ============================================================================

const express = require('express');
const {
  handleRegisterUser,
  handleLoginUser,
  handleGetUserProfile,
  handleUpdateUserProfile
} = require('../controllers/userController');
const {
  handleGetTasks,
  handleCreateTask,
  handleUpdateTask,
  handleCompleteTask,
  handleDeleteTask
} = require('../controllers/taskController');
const {
  handleGetSessions,
  handleStartSession,
  handleFinishSession,
  handleGetDashboardStats
} = require('../controllers/focusSessionController');
const {
  handleGetVapidKeys,
  handleGenerateVapidKeys,
  handleGetWebPushStatus,
  handleSimulatePushNotification
} = require('../controllers/webPushController');

const router = express.Router();

// --- AUTHENTICATION & PROFILE ROUTES ---
router.post('/auth/register', handleRegisterUser);
router.post('/auth/login', handleLoginUser);
router.get('/user', handleGetUserProfile);
router.put('/user', handleUpdateUserProfile);

// --- TASK MANAGEMENT ROUTES ---
router.get('/tasks', handleGetTasks);
router.post('/tasks', handleCreateTask);
router.put('/tasks/:id', handleUpdateTask);
router.patch('/tasks/:id/complete', handleCompleteTask);
router.delete('/tasks/:id', handleDeleteTask);

// --- FOCUS SESSIONS & DASHBOARD ROUTES ---
router.get('/sessions', handleGetSessions);
router.post('/sessions/start', handleStartSession);
router.patch('/sessions/:id/finish', handleFinishSession);
router.get('/dashboard', handleGetDashboardStats);

// --- WEB PUSH & VAPID ROUTES ---
router.get('/push/vapid', handleGetVapidKeys);
router.post('/push/vapid/generate', handleGenerateVapidKeys);
router.get('/push/status', handleGetWebPushStatus);
router.post('/push/simulate', handleSimulatePushNotification);

module.exports = router;
