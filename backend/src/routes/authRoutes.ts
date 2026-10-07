import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public routes - no authentication required
router.post('/register', register);
router.post('/login', login);

// Protected route - requires valid JWT
// requireAuth middleware runs first, then getMe
router.get('/me', requireAuth, getMe);

export default router;

