import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/dashboard
// Returns all the data needed to render the dashboard page in a single API call.
// This avoids making multiple separate API calls from the frontend.
export async function getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;

  try {
    // Get today's date range (midnight to midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch today's tasks
    const todaysTasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Count total completed tasks (all time)
    const totalTasksCompleted = await prisma.task.count({
      where: { userId, completed: true },
    });

    // Count completed focus sessions (all time)
    const totalFocusSessionsCompleted = await prisma.focusSession.count({
      where: { userId, status: 'COMPLETED' },
    });

    // Calculate total focus time in minutes (all completed sessions)
    const allCompletedSessions = await prisma.focusSession.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { duration: true },
    });

    const totalFocusMinutes = allCompletedSessions.reduce(
      (total, session) => total + session.duration,
      0
    );

    // Count tasks completed today
    const tasksCompletedToday = await prisma.task.count({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Calculate the user's current streak.
    // A streak counts consecutive days where the user completed at least one focus session.
    const currentStreak = await calculateStreak(userId);

    res.status(200).json({
      todaysTasks,
      totalTasksCompleted,
      totalFocusSessionsCompleted,
      totalFocusMinutes,
      tasksCompletedToday,
      currentStreak,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Could not fetch dashboard data.' });
  }
}

// Helper: Calculate the number of consecutive days the user has had
// at least one completed focus session.
async function calculateStreak(userId: number): Promise<number> {
  // Get all completed sessions ordered by date (most recent first)
  const sessions = await prisma.focusSession.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { completedAt: true },
    orderBy: { completedAt: 'desc' },
  });

  if (sessions.length === 0) return 0;

  // Extract unique dates (as "YYYY-MM-DD" strings) from the sessions
  const uniqueDates = new Set<string>();
  for (const session of sessions) {
    if (session.completedAt) {
      const dateStr = session.completedAt.toISOString().split('T')[0];
      uniqueDates.add(dateStr);
    }
  }

  const sortedDates = Array.from(uniqueDates).sort().reverse(); // Most recent first

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    if (sortedDates[i] === expectedDateStr) {
      streak++;
    } else {
      // Gap found - streak is broken
      break;
    }
  }

  return streak;
}

