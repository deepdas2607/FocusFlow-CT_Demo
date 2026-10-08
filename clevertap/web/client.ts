// FILE TYPE: CleverTap Web Client
// PURPOSE: Centralizes interaction with the CleverTap Web SDK (initialization, debug logs, global accessor).
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import { defaultCleverTapConfig, CleverTapConfig } from './config';

/**
 * Safely accesses the CleverTap SDK object on the browser window.
 * Returns null during SSR or if blocked by client environment.
 */
export function getCleverTap(): any | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return (window as any).clevertap || null;
}

/**
 * Initializes the CleverTap Web SDK.
 * Must be executed once on client mount in a React provider or root layout.
 */
export function initCleverTap(customConfig?: Partial<CleverTapConfig>): void {
  if (typeof window === 'undefined') return;

  const config = { ...defaultCleverTapConfig, ...customConfig };

  if (!config.accountId) {
    console.warn('[CleverTap Web] Account ID not provided. SDK initialization skipped.');
    return;
  }

  try {
    const clevertap = require('clevertap-web-sdk');

    // Initialize with Account ID and Region
    clevertap.init(config.accountId, config.region);

    // Set debug log level
    if (typeof clevertap.setLogLevel === 'function') {
      clevertap.setLogLevel(config.logLevel ?? 3);
    }

    // Default privacy configuration
    clevertap.privacy.push({ optOut: false });
    clevertap.privacy.push({ useIP: false });

    // Store reference globally
    (window as any).clevertap = clevertap;

    console.log('[CleverTap Web] Initialized successfully with Account:', config.accountId);
  } catch (error) {
    console.warn('[CleverTap Web] SDK initialization error:', error);
  }
}

