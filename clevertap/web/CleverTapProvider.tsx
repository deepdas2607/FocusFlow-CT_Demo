'use client';

// FILE TYPE: CleverTap React Provider
// PURPOSE: Reusable provider component to initialize the CleverTap Web SDK in a Next.js / React app.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import React, { useEffect } from 'react';
import { initCleverTap } from './client';
import { trackEvent, CLEVERTAP_EVENTS } from './events';

interface CleverTapProviderProps {
  children: React.ReactNode;
  accountId?: string;
  region?: string;
}

export default function CleverTapProvider({
  children,
  accountId,
  region,
}: CleverTapProviderProps) {
  useEffect(() => {
    const effectiveAccountId =
      accountId || process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID;
    const effectiveRegion =
      region || process.env.NEXT_PUBLIC_CLEVERTAP_REGION;

    if (!effectiveAccountId) {
      console.warn('[CleverTap Standalone Provider] NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID not configured.');
      return;
    }

    initCleverTap({ accountId: effectiveAccountId, region: effectiveRegion });
    trackEvent(CLEVERTAP_EVENTS.APP_LAUNCHED);
  }, [accountId, region]);

  return <>{children}</>;
}
