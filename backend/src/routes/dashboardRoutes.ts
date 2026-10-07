import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getDashboardData);

export default router;

