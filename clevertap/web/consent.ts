// FILE TYPE: CleverTap Privacy & Consent
// PURPOSE: Handles user tracking opt-out and IP suppression in compliance with GDPR/CCPA.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

import { getCleverTap } from './client';
import { trackEventWithProperties, CLEVERTAP_EVENTS } from './events';

/**
 * Updates the user's tracking opt-out status in CleverTap.
 *
 * When `optOut` is true:
 * CleverTap ceases future event tracking and profile updates on this device.
 */
export function setPrivacyOptOut(optOut: boolean): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.privacy.push({ optOut });
    trackEventWithProperties(CLEVERTAP_EVENTS.CONSENT_UPDATED, {
      'Tracking Opted Out': optOut,
    });
    console.log('[CleverTap Privacy] Updated optOut state to:', optOut);
  } catch (error) {
    console.warn('[CleverTap Privacy] Error setting optOut:', error);
  }
}

/**
 * Configures whether CleverTap auto-collects IP address.
 */
export function setIpCollection(useIP: boolean): void {
  const clevertap = getCleverTap();
  if (!clevertap) return;

  try {
    clevertap.privacy.push({ useIP });
    console.log('[CleverTap Privacy] Updated useIP state to:', useIP);
  } catch (error) {
    console.warn('[CleverTap Privacy] Error setting useIP:', error);
  }
}

