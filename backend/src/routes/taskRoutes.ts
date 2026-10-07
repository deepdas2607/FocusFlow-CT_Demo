import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask, completeTask } from '../controllers/taskController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All task routes require authentication
// requireAuth runs before every route handler here
router.use(requireAuth);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/complete', completeTask);

export default router;

