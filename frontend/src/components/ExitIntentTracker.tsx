'use client';

/**
 * ExitIntentTracker - Detects desktop exit intent behavior.
 *
 * HOW IT WORKS FOR CLEVERTAP LEARNING:
 * 1. When a user moves their mouse above the top boundary of the viewport (leaving the page),
 *    this component captures the action.
 * 2. It tracks the custom event: 'Exit Intent Triggered' with contextual properties
 *    (Current Page, Active Tasks Count, Focus Minutes Today).
 * 3. In the CleverTap Dashboard, you can create an In-App Web Campaign triggered by:
 *    "Event: Exit Intent Triggered"
 *    to render a targeted retention pop-up (e.g. "Don't lose your focus streak! Stay for 5 more minutes").
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackExitIntent } from '../lib/clevertap/client';

export default function ExitIntentTracker() {
  const pathname = usePathname();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Only bind on client desktop devices
    if (typeof window === 'undefined') return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when cursor leaves through the top boundary of the viewport
      if (e.clientY <= 0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;

        trackExitIntent({
          page: pathname,
          activeTasksCount: 0,
          focusMinutesToday: 0,
        });

        console.log('[Exit Intent] Detected exit intent on page:', pathname);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pathname]);

  return null; // Invisible telemetry component
}

