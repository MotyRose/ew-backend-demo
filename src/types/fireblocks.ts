import { TransactionResponse } from "fireblocks-sdk";

export interface WebhookPayload {
  createdAt: number;
  data: TransactionResponse | EWBalancePayload | UnknownPayload;
  eventType: string;
  id: string;
  resourceId: string;
  workspaceId: string;
}

export interface EWBalancePayload {
  walletId: string;
  accountId?: string;
  assetId?: string;
  total?: string;
  pending?: string;
  staked?: string;
  frozen?: string;
  lockedAmount?: string;
  blockHeight?: string;
  blockHash?: string;
  [key: string]: unknown;
}

export interface UnknownPayload {
  [key: string]: unknown;
}

// Push notification types
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string | number | boolean | object | null>; // JSON-serializable values
}
