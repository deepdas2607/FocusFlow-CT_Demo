'use client';

/**
 * CleverTapProvider - Initializes the CleverTap SDK when the app loads.
 *
 * This component wraps the app in the root layout and ensures CleverTap is
 * initialized exactly once on the client side. We use a separate component
 * for this because:
 * 1. CleverTap uses browser APIs (window, document) - can't run on server
 * 2. useEffect only runs on the client, never during SSR
 * 3. It keeps the initialization logic separate from the layout
 */

import { useEffect } from 'react';
import { initCleverTap, trackEvent } from '../lib/clevertap/client';
import { CLEVERTAP_EVENTS } from '../lib/clevertap/events';

export default function CleverTapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Read the CleverTap Account ID from environment variables
    // NEXT_PUBLIC_ prefix is required for Next.js to expose env vars to the browser
    const accountId = process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID;
    const region = process.env.NEXT_PUBLIC_CLEVERTAP_REGION;

    if (!accountId) {
      console.warn(
        '[CleverTap] NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID is not set. ' +
        'CleverTap tracking will be disabled. ' +
        'Add it to your .env.local file.'
      );
      return;
    }

    // Initialize CleverTap - this is the single initialization point for the entire app
    initCleverTap(accountId, region);

    // Track App Launched event on initial web application load
    trackEvent(CLEVERTAP_EVENTS.APP_LAUNCHED);
  }, []); // Empty dependency array = run once when component mounts

  // This component has no visual output - it just initializes the SDK
  return <>{children}</>;
}

