import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/profile
// Returns the authenticated user's full profile including preferences.
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

// PUT /api/profile
// Updates the authenticated user's profile and preferences.
// This is also where we signal the frontend to update the CleverTap user profile.
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
    // Update the user's personal information
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

    // Update user preferences if any preference fields were sent
    // We use upsert in case preferences weren't created yet (defensive coding)
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

    // Return the full updated profile so the frontend can update the CleverTap profile
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

