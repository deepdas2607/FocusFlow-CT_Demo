import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * GET /api/profile
 * 
 * Fetches the user's complete profile record and related preferences.
 * Uses Prisma's explicit select projection to exclude the sensitive passwordHash.
 */
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        occupation: true,
        interests: true,
        preferredFocusDuration: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Could not fetch profile.' });
  }
}

/**
 * PUT /api/profile
 * 
 * Updates the user's profile information and notification/privacy preferences:
 * 
 * Partial Update Mechanics in Prisma:
 * In Prisma, setting a field to 'undefined' tells Prisma to ignore that field and leave
 * the database column untouched. Setting it to 'null' actively clears the column.
 * We use '|| undefined' so any field not provided in req.body preserves its existing value.
 * 
 * Upsert Pattern:
 * We use `userPreferences.upsert()` so that if the user record exists but their preferences
 * record was somehow missing or corrupted, Prisma will automatically insert a row with defaults
 * instead of failing with a foreign key or record-not-found error.
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const {
    name,
    occupation,
    interests,
    preferredFocusDuration,
    notificationsEnabled,
    productivityReminders,
    sessionReminders,
    weeklySummary,
  } = req.body;

  try {
    // 1. Update personal details on the User model
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name?.trim() || undefined,
        occupation: occupation?.trim() || undefined,
        interests: interests?.trim() || undefined,
        preferredFocusDuration: preferredFocusDuration
          ? parseInt(preferredFocusDuration, 10)
          : undefined,
      },
    });

    // 2. Upsert the UserPreferences record (create if absent, update if present)
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : undefined,
        productivityReminders: productivityReminders !== undefined ? productivityReminders : undefined,
        sessionReminders: sessionReminders !== undefined ? sessionReminders : undefined,
        weeklySummary: weeklySummary !== undefined ? weeklySummary : undefined,
      },
      create: {
        userId,
        notificationsEnabled: notificationsEnabled ?? true,
        productivityReminders: productivityReminders ?? true,
        sessionReminders: sessionReminders ?? true,
        weeklySummary: weeklySummary ?? true,
      },
    });

    // 3. Return the consolidated updated profile
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        occupation: updatedUser.occupation,
        interests: updatedUser.interests,
        preferredFocusDuration: updatedUser.preferredFocusDuration,
        preferences: updatedPreferences,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Could not update profile.' });
  }
}


