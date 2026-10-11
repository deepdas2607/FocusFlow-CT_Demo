import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * POST /api/focus/start
 * 
 * Initiates a new focus session for the authenticated user:
 * 1. Validates that the requested duration is one of the allowed presets [1, 5, 25, 45, 60] minutes.
 * 2. If a taskId is associated with the session, verifies the task exists and belongs to the user.
 * 3. Creates a new FocusSession record with status: 'STARTED'.
 * 4. Counts prior sessions to determine if 'isFirstSession: true' milestone applies.
 */
export async function startFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { taskId, duration } = req.body;

  // Duration must be provided and must be a positive number
  if (!duration || typeof duration !== 'number' || duration <= 0) {
    res.status(400).json({ error: 'A valid duration (in minutes) is required.' });
    return;
  }

  // Validate allowed durations (standard pomodoro + quick sessions)
  const allowedDurations = [1, 5, 25, 45, 60];
  if (!allowedDurations.includes(duration)) {
    res.status(400).json({ error: 'Duration must be 1, 5, 25, 45, or 60 minutes.' });
    return;
  }

  try {
    // If a taskId was provided, verify that task belongs to this user
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: { id: taskId, userId },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
    }

    // Create the focus session record
    const focusSession = await prisma.focusSession.create({
      data: {
        userId,
        taskId: taskId || null,
        duration,
        status: 'STARTED',
      },
      include: {
        task: true, // Include task details so the frontend can display the task name
      },
    });

    // Count total sessions to detect the "first focus session" milestone
    const totalSessions = await prisma.focusSession.count({
      where: { userId },
    });

    res.status(201).json({
      message: 'Focus session started.',
      session: focusSession,
      isFirstSession: totalSessions === 1, // Used by the frontend for milestone events
    });
  } catch (error) {
    console.error('Error starting focus session:', error);
    res.status(500).json({ error: 'Could not start focus session.' });
  }
}

/**
 * POST /api/focus/:id/complete
 * 
 * Finalizes a focus session as successfully completed:
 * 1. Checks that session exists, belongs to caller, and is currently in 'STARTED' status.
 * 2. Computes the real elapsed minutes between startedAt and now.
 * 3. Evaluates 'completedOnTime': true if user completed within a 2-minute grace window of the goal.
 * 4. Updates session status to 'COMPLETED' with completedAt timestamp.
 * 5. Returns total completed session count for streak and analytics computation.
 */
export async function completeFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const sessionId = parseInt(req.params.id, 10);

  if (isNaN(sessionId)) {
    res.status(400).json({ error: 'Invalid session ID.' });
    return;
  }

  try {
    // Find the session and confirm it belongs to this user
    const session = await prisma.focusSession.findFirst({
      where: { id: sessionId, userId },
      include: { task: true },
    });

    if (!session) {
      res.status(404).json({ error: 'Focus session not found.' });
      return;
    }

    if (session.status !== 'STARTED') {
      res.status(400).json({ error: 'This session is already completed or abandoned.' });
      return;
    }

    const completedAt = new Date();

    // Calculate how long the session actually ran (in minutes)
    const elapsedMs = completedAt.getTime() - session.startedAt.getTime();
    const elapsedMinutes = Math.round(elapsedMs / 1000 / 60);

    // Determine if the user completed the session on time (within 2 minutes tolerance)
    const completedOnTime = elapsedMinutes >= session.duration - 2;

    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt,
      },
      include: { task: true },
    });

    // Count completed sessions for streak and milestone calculations
    const completedCount = await prisma.focusSession.count({
      where: { userId, status: 'COMPLETED' },
    });

    res.status(200).json({
      message: 'Focus session completed. Great work!',
      session: updatedSession,
      elapsedMinutes,
      completedOnTime,
      totalCompletedSessions: completedCount,
    });
  } catch (error) {
    console.error('Error completing focus session:', error);
    res.status(500).json({ error: 'Could not complete focus session.' });
  }
}

/**
 * POST /api/focus/:id/abandon
 * 
 * Records that a user stopped a session before completing the timer:
 * 1. Checks that session is currently in 'STARTED' status.
 * 2. Computes the partial elapsed time spent before quitting.
 * 3. Updates session status to 'ABANDONED'.
 */
export async function abandonFocusSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const sessionId = parseInt(req.params.id, 10);

  if (isNaN(sessionId)) {
    res.status(400).json({ error: 'Invalid session ID.' });
    return;
  }

  try {
    const session = await prisma.focusSession.findFirst({
      where: { id: sessionId, userId },
      include: { task: true },
    });

    if (!session) {
      res.status(404).json({ error: 'Focus session not found.' });
      return;
    }

    if (session.status !== 'STARTED') {
      res.status(400).json({ error: 'This session is already completed or abandoned.' });
      return;
    }

    // Calculate how much time elapsed before abandonment
    const now = new Date();
    const elapsedMs = now.getTime() - session.startedAt.getTime();
    const elapsedMinutes = Math.round(elapsedMs / 1000 / 60);

    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'ABANDONED',
        completedAt: now,
      },
      include: { task: true },
    });

    res.status(200).json({
      message: 'Focus session abandoned.',
      session: updatedSession,
      elapsedMinutes,
    });
  } catch (error) {
    console.error('Error abandoning focus session:', error);
    res.status(500).json({ error: 'Could not abandon focus session.' });
  }
}

/**
 * GET /api/focus/history
 * 
 * Fetches the user's historical focus sessions (up to 50 most recent),
 * ordered chronologically descending (newest first).
 */
export async function getFocusHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;

  try {
    const sessions = await prisma.focusSession.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { startedAt: 'desc' },
      take: 50, // Limit to last 50 sessions to keep the response size reasonable
    });

    res.status(200).json({ sessions });
  } catch (error) {
    console.error('Error fetching focus history:', error);
    res.status(500).json({ error: 'Could not fetch focus session history.' });
  }
}


