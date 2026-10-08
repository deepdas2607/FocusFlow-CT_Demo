// FILE TYPE: CleverTap Web Configuration
// PURPOSE: Manages CleverTap Web SDK configuration, project credentials, and region endpoints.
// STATUS: Standalone integration module.
// IMPORTANT: This file is not currently imported by the FocusFlow application.

export interface CleverTapConfig {
  accountId: string;
  region?: string;
  logLevel?: number; // 0 = off, 1 = error, 2 = info, 3 = debug
  enablePush?: boolean;
  enableInbox?: boolean;
}

export const defaultCleverTapConfig: CleverTapConfig = {
  accountId: process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID || '',
  region: process.env.NEXT_PUBLIC_CLEVERTAP_REGION || 'in1',
  logLevel: 3,
  enablePush: true,
  enableInbox: true,
};
