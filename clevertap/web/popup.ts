// FILE TYPE: CleverTap Web Pop-ups & Exit Intent
// PURPOSE: Handles web overlay triggers, event-driven in-app banners, and exit intent tracking.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import { trackEventWithProperties, ExitIntentProperties, CLEVERTAP_EVENTS } from './events';

/**
 * Tracks desktop exit intent behavior (e.g. mouse leaving top viewport boundary).
 * This event triggers Web Pop-up campaigns configured in the CleverTap Dashboard.
 */
export function trackExitIntent(properties: ExitIntentProperties): void {
  trackEventWithProperties(CLEVERTAP_EVENTS.EXIT_INTENT_TRIGGERED, {
    Page: properties.page,
    'Active Tasks Count': properties.activeTasksCount,
    'Focus Minutes Today': properties.focusMinutesToday,
  });
}

/**
 * Attaches a native mouseleave listener to detect desktop exit intent.
 * Returns a cleanup function.
 */
export function setupExitIntentListener(
  getPageContext: () => { page: string; activeTasksCount: number; focusMinutesToday: number }
): () => void {
  if (typeof window === 'undefined') return () => {};

  let hasTriggered = false;

  const handleMouseLeave = (e: MouseEvent) => {
    if (e.clientY <= 0 && !hasTriggered) {
      hasTriggered = true;
      const context = getPageContext();
      trackExitIntent(context);
    }
  };

  document.addEventListener('mouseleave', handleMouseLeave);
  return () => {
    document.removeEventListener('mouseleave', handleMouseLeave);
  };
}
