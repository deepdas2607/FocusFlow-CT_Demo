import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/tasks
// Returns all tasks belonging to the authenticated user.
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

// POST /api/tasks
// Creates a new task for the authenticated user.
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

// PUT /api/tasks/:id
// Updates an existing task. Only the task owner can update it.
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid task ID.' });
    return;
  }

  const { title, description, category, priority } = req.body;

  try {
    // First, check the task exists and belongs to this user
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

// DELETE /api/tasks/:id
// Deletes a task. Only the task owner can delete it.
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid task ID.' });
    return;
  }

  try {
    // Verify ownership before deleting
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

// POST /api/tasks/:id/complete
// Marks a task as completed. Records the completion timestamp.
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
      isFirstCompletion: totalCompleted === 1, // Frontend uses this for milestone tracking
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Could not complete task.' });
  }
}

