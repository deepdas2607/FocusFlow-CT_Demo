import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

// Create an Express Router instance to group all authentication-related endpoints
const router = Router();

// ==========================================
// PUBLIC ROUTES (No Token Needed)
// ==========================================

// POST /api/auth/register
// Receives: { name, email, password }
// Handled by: register controller in authController.ts
// Purpose: Allows a new user to create an account and receive an initial JWT token
router.post('/register', register);

// POST /api/auth/login
// Receives: { email, password }
// Handled by: login controller in authController.ts
// Purpose: Validates credentials and returns a fresh JWT token for existing users
router.post('/login', login);

// ==========================================
// PROTECTED ROUTES (Valid Token Required)
// ==========================================

// GET /api/auth/me
// Receives: Authorization header with 'Bearer <token>'
// Pipeline:
//   1. requireAuth: Verifies the JWT signature and extracts user ID
//   2. getMe: Fetches the verified user's profile from PostgreSQL
// Purpose: Used by the frontend on page refresh to restore the user session
router.get('/me', requireAuth, getMe);

export default router;

