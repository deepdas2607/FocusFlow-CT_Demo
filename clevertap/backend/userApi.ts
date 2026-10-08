// FILE TYPE: External API Service - User Profile API
// PURPOSE: Server-to-server user profile upload and demographic enrichment.
// STATUS: Prepared for future integration.
// IMPORTANT: Not currently used by FocusFlow business logic.

import { CleverTapBackendClient, cleverTapBackendClient } from './client';

export interface ServerUserProfilePayload {
  name: string;
  email: string;
  occupation?: string;
  interests?: string;
  preferredFocusDuration?: number;
  totalFocusMinutes?: number;
  totalSessionsCompleted?: number;
  currentStreak?: number;
  lifecycleStage?: string;
  [key: string]: any;
}

export class CleverTapUserApi {
  constructor(private client: CleverTapBackendClient = cleverTapBackendClient) {}

  /**
   * Uploads or updates a user profile from the backend server.
   */
  async pushProfile(userId: number | string, profile: ServerUserProfilePayload): Promise<any> {
    return this.client.uploadBatch([
      {
        identity: String(userId),
        type: 'profile',
        profileData: {
          Name: profile.name,
          Email: profile.email,
          ...(profile.occupation && { Occupation: profile.occupation }),
          ...(profile.interests && { Interests: profile.interests }),
          ...(profile.preferredFocusDuration !== undefined && {
            'Preferred Focus Duration': profile.preferredFocusDuration,
          }),
          ...(profile.totalFocusMinutes !== undefined && {
            'Total Focus Minutes': profile.totalFocusMinutes,
          }),
          ...(profile.totalSessionsCompleted !== undefined && {
            'Total Sessions Completed': profile.totalSessionsCompleted,
          }),
          ...(profile.currentStreak !== undefined && {
            'Current Streak': profile.currentStreak,
          }),
          ...(profile.lifecycleStage && {
            'Lifecycle Stage': profile.lifecycleStage,
          }),
          'Last Synced At': new Date().toISOString(),
        },
      },
    ]);
  }
}

export const cleverTapUserApi = new CleverTapUserApi();
