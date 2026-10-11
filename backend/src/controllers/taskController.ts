import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * GET /api/tasks
 * 
 * Fetches all tasks created by the logged-in user.
 * 
 * Security Note (Multi-Tenancy):
 * Notice the 'where: { userId }' clause. Even though tasks have an auto-incrementing id,
 * we strictly filter by the authenticated caller's userId to guarantee tenant isolation.
 * Results are sorted descending by createdAt so newly created tasks appear at the top.
 */
export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;

  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Show newest tasks first
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Could not fetch tasks.' });
  }
}

/**
 * POST /api/tasks
 * 
 * Creates a new task for the authenticated user:
 * 1. Validates that a non-empty title is supplied.
 * 2. Defaults category to 'General' and priority to 'Medium' if not specified.
 * 3. Associates the task with req.user.userId.
 */
export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { title, description, category, priority } = req.body;

  if (!title || title.trim() === '') {
    res.status(400).json({ error: 'Task title is required.' });
    return;
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'General',
        priority: priority || 'Medium',
      },
    });

    res.status(201).json({
      message: 'Task created successfully.',
      task: newTask,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Could not create task.' });
  }
}

/**
 * PUT /api/tasks/:id
 * 
 * Updates an existing task.
 * 
 * IDOR Prevention:
 * Before performing the update, we look up the task using both 'id' and 'userId'.
 * If the task belongs to another user, findFirst returns null and we respond with 404.
 * This completely prevents users from modifying other people's tasks by guessing task IDs.
 */
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid task ID.' });
    return;
  }

  const { title, description, category, priority } = req.body;

  try {
    // Verify task exists and belongs to the authenticated user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title?.trim() || existingTask.title,
        description: description !== undefined ? description?.trim() : existingTask.description,
        category: category || existingTask.category,
        priority: priority || existingTask.priority,
      },
    });

    res.status(200).json({
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Could not update task.' });
  }
}

/**
 * DELETE /api/tasks/:id
 * 
 * Deletes a task by ID after confirming ownership.
 */
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid task ID.' });
    return;
  }

  try {
    // Verify ownership before deleting to prevent unauthorized deletions
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Could not delete task.' });
  }
}

/**
 * POST /api/tasks/:id/complete
 * 
 * Marks a task as completed and timestamps the completion.
 * 
 * Milestone Detection:
 * Counts total completed tasks by this user. If totalCompleted === 1,
 * flags 'isFirstCompletion: true' in the response so the UI or event trackers
 * can trigger celebratory badges or milestone campaigns.
 */
export async function completeTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid task ID.' });
    return;
  }

  try {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    if (existingTask.completed) {
      res.status(400).json({ error: 'Task is already completed.' });
      return;
    }

    const completedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Count total completed tasks - used to detect the first completion milestone
    const totalCompleted = await prisma.task.count({
      where: { userId, completed: true },
    });

    res.status(200).json({
      message: 'Task marked as complete.',
      task: completedTask,
      totalTasksCompleted: totalCompleted,
      isFirstCompletion: totalCompleted === 1, // Milestone flag
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Could not complete task.' });
  }
}


