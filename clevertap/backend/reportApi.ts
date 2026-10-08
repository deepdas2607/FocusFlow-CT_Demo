// FILE TYPE: External API Service - Reporting & Analytics Data API
// PURPOSE: Handles server-to-server data export, event data download, and audience profile queries.
// STATUS: Prepared for future integration.
// IMPORTANT: Not currently used by FocusFlow business logic.

import { CleverTapBackendClient, cleverTapBackendClient } from './client';

export interface EventReportQuery {
  eventName: string;
  from: number; // YYYYMMDD
  to: number;   // YYYYMMDD
  props?: Record<string, any>;
}

export class CleverTapReportApi {
  constructor(private client: CleverTapBackendClient = cleverTapBackendClient) {}

  /**
   * Data Export API Specification:
   * CleverTap provides endpoints to extract historical raw event records for data warehouses:
   * Endpoint: POST https://api.clevertap.com/1/events.json
   */
  async queryEvents(query: EventReportQuery): Promise<any> {
    console.log('[CleverTap Report API] Querying events for:', query.eventName, 'Range:', query.from, 'to', query.to);
    return { status: 'prepared', query };
  }

  /**
   * User Profile Export API Specification:
   * Endpoint: POST https://api.clevertap.com/1/profile.json
   */
  async queryUserProfile(identity: string | number): Promise<any> {
    console.log('[CleverTap Report API] Querying profile for identity:', identity);
    return { status: 'prepared', identity: String(identity) };
  }
}

export const cleverTapReportApi = new CleverTapReportApi();

