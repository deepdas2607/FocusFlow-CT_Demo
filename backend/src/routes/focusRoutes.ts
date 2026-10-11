import { Router } from 'express';
import {
  startFocusSession,
  completeFocusSession,
  abandonFocusSession,
  getFocusHistory,
} from '../controllers/focusController';
import { requireAuth } from '../middleware/auth';

// Create Router instance for Focus Sessions (Pomodoro Timer)
const router = Router();

// =========================================================================
// SECURITY MIDDLEWARE
// =========================================================================
// Protects all timer endpoints so focus minutes and history belong strictly
// to the logged-in user.
router.use(requireAuth);

// =========================================================================
// FOCUS SESSION LIFECYCLE ENDPOINTS
// =========================================================================

// POST /api/focus/start
// Receives: { duration: 1 | 5 | 25 | 45 | 60, taskId?: number }
// Purpose: Begins a timed session, creates a STARTED row in PostgreSQL
router.post('/start', startFocusSession);

// POST /api/focus/:id/complete
// Receives: URL parameter :id (session ID)
// Purpose: Automatically or manually marks session COMPLETED, stamps completedAt,
//          calculates elapsed minutes, and updates user streak totals
router.post('/:id/complete', completeFocusSession);

// POST /api/focus/:id/abandon
// Receives: URL parameter :id (session ID)
// Purpose: Marks session ABANDONED when user stops early, preserving record of time spent
router.post('/:id/abandon', abandonFocusSession);

// GET /api/focus/history
// Purpose: Fetches past 50 focus sessions ordered newest first for analytics
router.get('/history', getFocusHistory);

export default router;

