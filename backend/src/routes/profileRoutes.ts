import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Both profile routes require authentication
router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;

