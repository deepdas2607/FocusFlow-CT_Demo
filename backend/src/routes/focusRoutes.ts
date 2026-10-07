import { Router } from 'express';
import {
  startFocusSession,
  completeFocusSession,
  abandonFocusSession,
  getFocusHistory,
} from '../controllers/focusController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All focus session routes require authentication
router.use(requireAuth);

router.post('/start', startFocusSession);
router.post('/:id/complete', completeFocusSession);
router.post('/:id/abandon', abandonFocusSession);
router.get('/history', getFocusHistory);

export default router;

