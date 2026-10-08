// FILE TYPE: External API Service
// PURPOSE: Core server-side HTTP transport to CleverTap's REST API (/1/upload).
// STATUS: Prepared for future integration.
// IMPORTANT: Not currently used by FocusFlow business logic.

export interface CleverTapServerRecord {
  identity: string | number;
  type: 'event' | 'profile';
  evtName?: string;
  evtData?: Record<string, any>;
  profileData?: Record<string, any>;
  ts?: number; // Epoch timestamp in seconds
}

export interface CleverTapBackendConfig {
  accountId: string;
  passcode: string;
  region: string;
}

export class CleverTapBackendClient {
  private accountId: string;
  private passcode: string;
  private endpoint: string;

  constructor(config?: Partial<CleverTapBackendConfig>) {
    this.accountId = config?.accountId || process.env.CLEVERTAP_ACCOUNT_ID || '';
    this.passcode = config?.passcode || process.env.CLEVERTAP_PASSCODE || '';
    const region = config?.region || process.env.CLEVERTAP_REGION || 'in1';
    this.endpoint = region
      ? `https://${region}.api.clevertap.com/1/upload`
      : 'https://api.clevertap.com/1/upload';
  }

  /**
   * Uploads a batch of records (events or profile updates) to CleverTap.
   * Specification: https://developer.clevertap.com
   */
  async uploadBatch(records: CleverTapServerRecord[]): Promise<any> {
    if (!this.accountId || !this.passcode) {
      console.warn('[CleverTap Server Client] Missing credentials (ACCOUNT_ID or PASSCODE).');
      return { status: 'skipped', message: 'Credentials not configured' };
    }

    const payload = {
      d: records.map((record) => ({
        ...record,
        ts: record.ts || Math.floor(Date.now() / 1000),
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
      console.log('[CleverTap Server Client] Response:', data);
      return data;
    } catch (error) {
      console.error('[CleverTap Server Client] Failed batch upload:', error);
      throw error;
    }
  }
}

export const cleverTapBackendClient = new CleverTapBackendClient();
