import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

// Create Router instance for Dashboard aggregation
const router = Router();

// =========================================================================
// SECURITY MIDDLEWARE
// =========================================================================
// Dashboard metrics contain private statistics (streaks, task totals, focus time)
// so authentication is strictly required.
router.use(requireAuth);

// GET /api/dashboard
// Purpose: Aggregates all user home screen metrics in a single network roundtrip:
//          - Today's tasks list
//          - Completed tasks today vs all-time
//          - Total completed focus sessions and total focus minutes
//          - Current consecutive day streak calculation
router.get('/', getDashboardData);

export default router;

