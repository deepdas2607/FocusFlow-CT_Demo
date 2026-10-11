import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * GET /api/dashboard
 * 
 * BFF (Backend-For-Frontend) Aggregation Pattern:
 * Instead of forcing the frontend client to make 5 separate HTTP roundtrips
 * (fetch tasks, fetch completed count, fetch sessions, calculate focus time, calculate streak),
 * this endpoint aggregates all the metrics required to render the home dashboard in a single query:
 * 
 * 1. Today's tasks (created between today 00:00:00 and 23:59:59.999).
 * 2. Total all-time completed tasks.
 * 3. Total all-time completed focus sessions.
 * 4. Total focus time in minutes across all completed sessions.
 * 5. Tasks completed today.
 * 6. Current consecutive-day focus streak.
 */
export async function getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;

  try {
    // Determine the start and end of the current calendar day in local server time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Fetch tasks created today
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

    // 2. Count total completed tasks (all-time)
    const totalTasksCompleted = await prisma.task.count({
      where: { userId, completed: true },
    });

    // 3. Count total completed focus sessions (all-time)
    const totalFocusSessionsCompleted = await prisma.focusSession.count({
      where: { userId, status: 'COMPLETED' },
    });

    // 4. Sum up total focus minutes across all completed sessions
    const allCompletedSessions = await prisma.focusSession.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { duration: true },
    });

    const totalFocusMinutes = allCompletedSessions.reduce(
      (total, session) => total + session.duration,
      0
    );

    // 5. Count tasks completed specifically today
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

    // 6. Calculate consecutive-day focus streak
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

/**
 * Helper: calculateStreak
 * 
 * Computes how many consecutive days (ending today or yesterday) the user has completed
 * at least one focus session:
 * 
 * Algorithm:
 * 1. Fetch completed sessions with their completedAt dates.
 * 2. Collapse timestamps into a Set of unique ISO date strings ("YYYY-MM-DD").
 * 3. Sort dates in reverse chronological order (newest date first).
 * 4. Step backwards day-by-day starting from today:
 *    - If today has a session, streak starts incrementing.
 *    - If there is a missing date in the chain, the streak terminates.
 */
async function calculateStreak(userId: number): Promise<number> {
  // Get all completed sessions ordered by completion date (most recent first)
  const sessions = await prisma.focusSession.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { completedAt: true },
    orderBy: { completedAt: 'desc' },
  });

  if (sessions.length === 0) return 0;

  // Extract unique calendar dates (as "YYYY-MM-DD" strings)
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

  // Iterate backwards from today day-by-day
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


