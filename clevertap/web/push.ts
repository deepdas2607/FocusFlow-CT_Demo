// FILE TYPE: CleverTap Web Push Notifications
// PURPOSE: Handles browser Web Push notification permissions, soft-prompt UI, and subscription callbacks.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import { getCleverTap } from './client';
import { trackEvent, CLEVERTAP_EVENTS } from './events';

export interface WebPushPromptConfig {
  titleText?: string;
  bodyText?: string;
  okButtonText?: string;
  rejectButtonText?: string;
  okButtonColor?: string;
}

/**
 * Requests browser Web Push notification permissions using CleverTap's soft prompt.
 *
 * CLEVERTAP WEB PUSH REQUIREMENTS:
 * 1. Site served over HTTPS (or localhost for development)
 * 2. VAPID keys entered in CleverTap Dashboard > Settings > Channels > Web Push
 * 3. CleverTap service worker hosted at the web root: `/clevertap_sw.js`
 */
export function requestWebPushPermission(config?: WebPushPromptConfig): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    trackEvent(CLEVERTAP_EVENTS.WEB_PUSH_OPT_IN_SHOWN);

    clevertap.notifications.push({
      titleText: config?.titleText || 'FocusFlow Productivity Reminders',
      bodyText: config?.bodyText || 'Get nudge reminders for scheduled focus sessions and streak achievements.',
      okButtonText: config?.okButtonText || 'Enable Reminders',
      rejectButtonText: config?.rejectButtonText || 'Not Now',
      okButtonColor: config?.okButtonColor || '#4f46e5',
      subscriptionCallback: (status: string) => {
        if (status === 'granted') {
          trackEvent(CLEVERTAP_EVENTS.WEB_PUSH_SUBSCRIBED);
          console.log('[CleverTap Web Push] Subscription granted');
        } else {
          trackEvent(CLEVERTAP_EVENTS.WEB_PUSH_DISMISSED);
          console.log('[CleverTap Web Push] Subscription dismissed');
        }
      },
    });

    console.log('[CleverTap Web Push] Soft prompt triggered');
  } catch (error) {
    console.warn('[CleverTap Web Push] Error requesting permission:', error);
  }
}
