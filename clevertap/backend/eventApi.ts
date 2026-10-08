// FILE TYPE: External API Service - Event Ingestion API
// PURPOSE: Server-to-server event tracking for backend business logic actions.
// STATUS: Prepared for future integration.
// IMPORTANT: Not currently used by FocusFlow business logic.

import { CleverTapBackendClient, cleverTapBackendClient } from './client';

export class CleverTapEventApi {
  constructor(private client: CleverTapBackendClient = cleverTapBackendClient) {}

  /**
   * Tracks a server-side event for an authenticated user.
   */
  async trackServerEvent(
    userId: number | string,
    eventName: string,
    eventData: Record<string, any>
  ): Promise<any> {
    return this.client.uploadBatch([
      {
        identity: String(userId),
        type: 'event',
        evtName: eventName,
        evtData: eventData,
      },
    ]);
  }
}

export const cleverTapEventApi = new CleverTapEventApi();

