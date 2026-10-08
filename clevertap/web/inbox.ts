// FILE TYPE: CleverTap Web Inbox (App Inbox)
// PURPOSE: Manages Web Inbox initialization, unread message count, and display panel triggers.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import { getCleverTap } from './client';
import { trackEvent, CLEVERTAP_EVENTS } from './events';

/**
 * Initializes the Web Inbox message listener.
 * In the CleverTap Dashboard (Settings > Channels > Web Inbox),
 * you configure the trigger Element ID (e.g. 'ct-inbox-button').
 */
export function initWebInbox(): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    if (typeof clevertap.initInbox === 'function') {
      clevertap.initInbox();
      console.log('[CleverTap Web Inbox] Initialized');
    }
  } catch (error) {
    console.warn('[CleverTap Web Inbox] Initialization error:', error);
  }
}

/**
 * Gets count of unread messages currently in the Web Inbox.
 */
export function getUnreadInboxMessageCount(): number {
  const clevertap = getCleverTap();
  if (!clevertap) return 0;

  try {
    if (typeof clevertap.getUnreadInboxMessageCount === 'function') {
      return clevertap.getUnreadInboxMessageCount() || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Opens the persistent Web Inbox message modal/panel.
 */
export function showInbox(tabs: string[] = ['All', 'Updates', 'Streaks']): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    trackEvent(CLEVERTAP_EVENTS.WEB_INBOX_OPENED);
    if (typeof clevertap.showInbox === 'function') {
      clevertap.showInbox({ tabs });
      console.log('[CleverTap Web Inbox] Displayed inbox modal');
    }
  } catch (error) {
    console.warn('[CleverTap Web Inbox] Error showing inbox:', error);
  }
}

