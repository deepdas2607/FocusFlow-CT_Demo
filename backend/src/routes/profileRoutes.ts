import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { requireAuth } from '../middleware/auth';

// Create Router instance for User Profile and Preferences
const router = Router();

// =========================================================================
// SECURITY MIDDLEWARE
// =========================================================================
// Personal settings and notifications require user authentication.
router.use(requireAuth);

// GET /api/profile
// Purpose: Returns the authenticated user's details (name, email, occupation,
//          interests, preferred focus duration) and linked notification preferences
router.get('/', getProfile);

// PUT /api/profile
// Receives: Object with any editable fields (name, occupation, interests, notification toggles)
// Purpose: Updates user table and upserts userPreferences in PostgreSQL
router.put('/', updateProfile);

export default router;

