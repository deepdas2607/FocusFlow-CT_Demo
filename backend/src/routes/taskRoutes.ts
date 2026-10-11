import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask, completeTask } from '../controllers/taskController';
import { requireAuth } from '../middleware/auth';

// Create Router instance for Task Management
const router = Router();

// =========================================================================
// SECURITY MIDDLEWARE
// =========================================================================
// router.use(requireAuth) applies requireAuth to EVERY route in this file.
// Any incoming request without a valid Bearer JWT is rejected immediately
// with HTTP 401 Unauthorized before any controller code is reached.
router.use(requireAuth);

// =========================================================================
// TASK CRUD ENDPOINTS
// =========================================================================

// GET /api/tasks
// Purpose: Retrieves all tasks belonging to the authenticated user (sorted newest first)
router.get('/', getTasks);

// POST /api/tasks
// Receives: { title, description?, category?, priority? }
// Purpose: Creates a new task tied to the user's ID
router.post('/', createTask);

// PUT /api/tasks/:id
// Receives: URL parameter :id (task ID) and body with fields to update
// Purpose: Modifies an existing task (verifies ownership before saving)
router.put('/:id', updateTask);

// DELETE /api/tasks/:id
// Receives: URL parameter :id (task ID)
// Purpose: Permanently deletes a task (verifies ownership before deleting)
router.delete('/:id', deleteTask);

// POST /api/tasks/:id/complete
// Receives: URL parameter :id (task ID)
// Purpose: Marks a task as completed and records the completedAt timestamp
router.post('/:id/complete', completeTask);

export default router;

