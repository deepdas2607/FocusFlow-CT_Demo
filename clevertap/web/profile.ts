// FILE TYPE: CleverTap User Profile
// PURPOSE: Manages user profile attributes and updates via `clevertap.profile.push`.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import { getCleverTap } from './client';

export interface CleverTapUserProfile {
  name: string;
  email: string;
  identity: string | number; // Primary unique identifier (Database user ID)
  occupation?: string;
  interests?: string;
  preferredFocusDuration?: number;
  notificationsEnabled?: boolean;
  totalFocusMinutes?: number; // Primary RFM Value metric
  totalSessionsCompleted?: number; // RFM Frequency metric
  totalTasksCompleted?: number;
  currentStreak?: number;
  lifecycleStage?: 'New' | 'Active' | 'Power User' | 'At Risk' | 'Dormant';
  dataProcessingConsent?: boolean;
  marketingConsent?: boolean;
  signupDate?: string;
}

/**
 * Updates an already identified user profile via `profile.push`.
 * Unlike `onUserLogin`, this modifies attributes without restarting the session.
 */
export function updateUserProfile(properties: Partial<CleverTapUserProfile>): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    const siteProperties: Record<string, any> = {};

    if (properties.name) siteProperties['Name'] = properties.name;
    if (properties.email) siteProperties['Email'] = properties.email;
    if (properties.occupation !== undefined) siteProperties['Occupation'] = properties.occupation;
    if (properties.interests !== undefined) siteProperties['Interests'] = properties.interests;
    if (properties.preferredFocusDuration !== undefined) {
      siteProperties['Preferred Focus Duration'] = properties.preferredFocusDuration;
    }
    if (properties.notificationsEnabled !== undefined) {
      siteProperties['Notifications Enabled'] = properties.notificationsEnabled;
    }
    if (properties.totalFocusMinutes !== undefined) {
      siteProperties['Total Focus Minutes'] = properties.totalFocusMinutes;
    }
    if (properties.totalSessionsCompleted !== undefined) {
      siteProperties['Total Sessions Completed'] = properties.totalSessionsCompleted;
    }
    if (properties.totalTasksCompleted !== undefined) {
      siteProperties['Total Tasks Completed'] = properties.totalTasksCompleted;
    }
    if (properties.currentStreak !== undefined) {
      siteProperties['Current Streak'] = properties.currentStreak;
    }
    if (properties.lifecycleStage !== undefined) {
      siteProperties['Lifecycle Stage'] = properties.lifecycleStage;
    }
    if (properties.dataProcessingConsent !== undefined) {
      siteProperties['Data Processing Consent'] = properties.dataProcessingConsent;
    }
    if (properties.marketingConsent !== undefined) {
      siteProperties['Marketing Consent'] = properties.marketingConsent;
    }

    siteProperties['Last Active Date'] = new Date().toISOString();

    clevertap.profile.push({ Site: siteProperties });
    console.log('[CleverTap Standalone Profile] Updated attributes:', siteProperties);
  } catch (error) {
    console.warn('[CleverTap Standalone Profile] Error updating profile:', error);
  }
}

