// FILE TYPE: CleverTap Identity Resolution
// PURPOSE: Handles anonymous-to-identified user profile resolution via `clevertap.onUserLogin`.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import { getCleverTap } from './client';
import { CleverTapUserProfile } from './profile';

/**
 * Identifies a user in CleverTap via `onUserLogin`.
 *
 * HOW IDENTITY RESOLUTION WORKS IN CLEVERTAP:
 * 1. Prior to login, CleverTap assigns an anonymous cookie-based GUID.
 * 2. When `onUserLogin.push` is called with a stable `Identity` (FocusFlow User ID)
 *    and `Email`, CleverTap merges all pre-login anonymous events into the
 *    permanent user profile.
 * 3. Subsequent logins across browsers or devices with the same Identity
 *    unify under the same customer profile.
 */
export function identifyUser(profile: CleverTapUserProfile): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.onUserLogin.push({
      Site: {
        // Standard CleverTap properties
        Name: profile.name,
        Email: profile.email,
        Identity: String(profile.identity),

        // Custom Demographics & Preferences
        Occupation: profile.occupation || 'Not Specified',
        Interests: profile.interests || '',
        'Preferred Focus Duration': profile.preferredFocusDuration || 25,
        'Notifications Enabled': profile.notificationsEnabled ?? true,

        // Custom Metrics for RFM & Lifecycle Analysis
        'Total Focus Minutes': profile.totalFocusMinutes ?? 0,
        'Total Sessions Completed': profile.totalSessionsCompleted ?? 0,
        'Total Tasks Completed': profile.totalTasksCompleted ?? 0,
        'Current Streak': profile.currentStreak ?? 0,
        'Lifecycle Stage': profile.lifecycleStage ?? 'New',

        // Privacy & Consent Flags (GDPR/Compliance)
        'Data Processing Consent': profile.dataProcessingConsent ?? true,
        'Marketing Consent': profile.marketingConsent ?? true,
        'Last Active Date': new Date().toISOString(),
      },
    });

    console.log('[CleverTap Standalone Identity] Identified:', profile.email, 'Identity:', profile.identity);
  } catch (error) {
    console.warn('[CleverTap Standalone Identity] Error identifying user:', error);
  }
}

/**
 * Handles user logout in CleverTap.
 */
export function logoutCleverTapUser(): void {
  console.log('[CleverTap Standalone Identity] Session ended on user logout');
}
