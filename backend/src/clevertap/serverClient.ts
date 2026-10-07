/**
 * CleverTap Server-Side API Client (Phase 3 / Day 13)
 *
 * PURPOSE IN TRAINING CURRICULUM:
 * Demonstrates how a Node.js/Express backend interacts with CleverTap's REST APIs:
 * - User Profile API: Uploading/updating user profiles from the server
 * - Event Ingestion API: Uploading server-side events directly to CleverTap (/1/upload)
 *
 * CLEVERTAP REST API SPECIFICATION:
 * - Base Endpoint: https://api.clevertap.com/1/upload (or regional endpoints like in1.api.clevertap.com)
 * - Required Headers:
 *     X-CleverTap-Account-Id: <Your Project Account ID>
 *     X-CleverTap-Passcode: <Your Project Passcode / API Secret>
 *     Content-Type: application/json
 */

export interface CleverTapServerEventPayload {
  identity: string | number; // User identifier
  type: 'event';
  evtName: string;
  evtData: Record<string, any>;
  ts?: number; // Epoch timestamp in seconds
}

export interface CleverTapServerProfilePayload {
  identity: string | number;
  type: 'profile';
  profileData: Record<string, any>;
  ts?: number;
}

export class CleverTapServerClient {
  private accountId: string;
  private passcode: string;
  private endpoint: string;

  constructor() {
    this.accountId = process.env.CLEVERTAP_ACCOUNT_ID || '';
    this.passcode = process.env.CLEVERTAP_PASSCODE || '';
    const region = process.env.CLEVERTAP_REGION || 'in1';
    this.endpoint = region ? `https://${region}.api.clevertap.com/1/upload` : 'https://api.clevertap.com/1/upload';
  }

  /**
   * Upload a batch of events or profiles to CleverTap via Server-to-Server REST API.
   *
   * Payload format:
   * {
   *   "d": [
   *     {
   *       "identity": "1",
   *       "type": "event",
   *       "evtName": "Focus Session Completed",
   *       "evtData": { "Duration (minutes)": 25, "Completed On Time": true }
   *     }
   *   ]
   * }
   */
  async uploadBatch(records: (CleverTapServerEventPayload | CleverTapServerProfilePayload)[]): Promise<any> {
    if (!this.accountId || !this.passcode) {
      console.warn('[CleverTap Server API] Missing CLEVERTAP_ACCOUNT_ID or CLEVERTAP_PASSCODE in backend .env.');
      return { status: 'skipped', message: 'Credentials not configured' };
    }

    const payload = {
      d: records.map((r) => ({
        ...r,
        ts: r.ts || Math.floor(Date.now() / 1000),
      })),
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'X-CleverTap-Account-Id': this.accountId,
          'X-CleverTap-Passcode': this.passcode,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('[CleverTap Server API] Response:', data);
      return data;
    } catch (error) {
      console.error('[CleverTap Server API] Failed to upload batch:', error);
      throw error;
    }
  }

  /**
   * Helper to push a server-side event for an authenticated user.
   */
  async trackServerEvent(userId: number, eventName: string, eventData: Record<string, any>): Promise<any> {
    return this.uploadBatch([
      {
        identity: String(userId),
        type: 'event',
        evtName: eventName,
        evtData: eventData,
      },
    ]);
  }

  /**
   * Helper to update user profile attributes from the server.
   */
  async updateServerProfile(userId: number, profileData: Record<string, any>): Promise<any> {
    return this.uploadBatch([
      {
        identity: String(userId),
        type: 'profile',
        profileData,
      },
    ]);
  }
}

// Export singleton instance for optional use in controllers
export const cleverTapServerClient = new CleverTapServerClient();

