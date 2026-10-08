// FILE TYPE: External API Service - Campaign & Messaging API
// PURPOSE: Server-side campaign triggering, transactional push/SMS/email dispatch, and Linked Content specs.
// STATUS: Prepared for future integration.
// IMPORTANT: Not currently used by FocusFlow business logic.

import { CleverTapBackendClient, cleverTapBackendClient } from './client';

export interface SendPushNotificationPayload {
  to: {
    Identity?: string[];
    FBID?: string[];
    GPID?: string[];
  };
  content: {
    title: string;
    body: string;
    platformSpecific?: Record<string, any>;
  };
}

export class CleverTapCampaignApi {
  constructor(private client: CleverTapBackendClient = cleverTapBackendClient) {}

  /**
   * Prepares payload for CleverTap's Transactional Push Notification API:
   * Endpoint: POST https://api.clevertap.com/1/send/push.json
   */
  async sendTransactionalPush(payload: SendPushNotificationPayload): Promise<any> {
    console.log('[CleverTap Campaign API] Transactional push requested for identities:', payload.to.Identity);
    // Future integration: invoke CleverTap Transactional Push API
    return { status: 'prepared', payload };
  }

  /**
   * Dynamic Linked Content Reference:
   * FocusFlow exposes public REST endpoints that CleverTap campaign templates query at delivery time:
   * - GET /api/public/linked-content/quote
   * - GET /api/public/linked-content/presets
   *
   * Template usage in CleverTap:
   * {{#linked_content url='http://your-server:4000/api/public/linked-content/quote'}}
   *   "{{quote}}" - {{author}}
   * {{/linked_content}}
   */
  getLinkedContentSpec(): Record<string, string> {
    return {
      quoteEndpoint: '/api/public/linked-content/quote',
      presetsEndpoint: '/api/public/linked-content/presets',
    };
  }
}

export const cleverTapCampaignApi = new CleverTapCampaignApi();
