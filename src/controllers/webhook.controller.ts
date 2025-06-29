import { Request, RequestHandler, Response } from "express";
import {
  PeerType,
  TransactionResponse,
  TransactionStatus,
} from "fireblocks-sdk";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { BadRequestError, InternalServerError } from "../errors/api.errors.js";
import { notificationService } from "../services/notification.service.js";
import { EWBalancePayload, WebhookPayload } from "../types/fireblocks.js";
import { getBooleanEnv } from "../util/env.js";
import { logger } from "../util/logger.js";
import { BaseController } from "./base.controller.js";

export class WebhookController extends BaseController {
  /**
   * Handles incoming Fireblocks webhook events.
   *
   * This request handler processes webhook payloads, validates them for required fields,
   * logs the incoming data, saves the webhook data to a file, and routes the event
   * to appropriate handlers based on the event type.
   *
   * @returns {RequestHandler} Express request handler function
   * @throws {BadRequestError} When webhook payload is invalid
   * @throws {InternalServerError} When webhook processing fails
   */
  handleWebhookEvent(): RequestHandler {
    return this.handleRequest((req: Request, res: Response) => {
      const webhook = req.body as unknown;

      if (!this.isValidWebhook(webhook)) {
        logger.warn("Invalid webhook payload received", { payload: webhook });
        throw new BadRequestError(
          "Invalid webhook payload",
          "INVALID_WEBHOOK_PAYLOAD",
        );
      }

      const logContext = {
        eventId: webhook.id,
        eventType: webhook.eventType,
        resourceId: webhook.resourceId,
      };

      logger.info("Received webhook", logContext);

      try {
        // Process webhook asynchronously to respond quickly
        void this.processWebhook(webhook).catch((error) => {
          logger.error("Async webhook processing failed", {
            ...logContext,
            error,
          });
        });

        this.sendResponse(res, { eventId: webhook.id });
      } catch (error) {
        logger.error("Error in webhook handler", { ...logContext, error });
        throw new InternalServerError(
          "Error processing webhook",
          "WEBHOOK_PROCESSING_ERROR",
        );
      }
    });
  }

  /**
   * Processes the webhook asynchronously after responding to the client.
   * @throws {Error} When webhook processing fails
   */
  private async processWebhook(webhook: WebhookPayload): Promise<void> {
    try {
      await this.saveWebhookToFile(webhook);

      if (webhook.eventType.startsWith("transaction")) {
        await this.handleTransactionEvent(webhook);
      } else if (webhook.eventType.startsWith("embedded_wallet")) {
        await this.handleEmbeddedWalletEvent(webhook);
      } else {
        logger.warn("Unhandled webhook event type", {
          eventType: webhook.eventType,
        });
      }
    } catch (error) {
      logger.error("Failed to process webhook", {
        eventType: webhook.eventType,
        error,
      });
      throw new InternalServerError(
        "Failed to process webhook",
        "WEBHOOK_PROCESSING_ERROR",
      );
    }
  }

  /**
   * Validates the webhook payload structure.
   */
  private isValidWebhook(webhook: unknown): webhook is WebhookPayload {
    if (!webhook || typeof webhook !== "object") {
      return false;
    }

    const candidate = webhook as Partial<WebhookPayload>;
    return (
      typeof candidate.eventType === "string" &&
      candidate.data !== null &&
      candidate.data !== undefined
    );
  }

  /**
   * Handles a transaction webhook event from the Fireblocks platform.
   * @throws {InternalServerError} When transaction processing fails
   */
  private async handleTransactionEvent(webhook: WebhookPayload): Promise<void> {
    const transaction = webhook.data as TransactionResponse;
    const logContext = {
      eventType: webhook.eventType,
      txId: transaction.id,
      status: transaction.status,
    };

    try {
      const participants = this.getTransactionParticipants(transaction);

      if (participants.length === 0) {
        logger.info("No participants found for transaction", logContext);
        return;
      }

      if (this.isNotifiableStatus(transaction.status)) {
        await this.sendTransactionNotification(
          participants,
          transaction,
          webhook,
        );
        logger.info("Transaction notification sent successfully", logContext);
      } else {
        logger.info("Event ignored - not a notifiable status", logContext);
      }
    } catch (error) {
      logger.error("Failed to handle transaction event", {
        ...logContext,
        error,
      });
      throw new InternalServerError(
        "Failed to handle transaction event",
        "TRANSACTION_EVENT_ERROR",
      );
    }
  }

  /**
   * Sends a transaction notification to participants
   * @throws {InternalServerError} When notification fails to send
   */
  private async sendTransactionNotification(
    participants: string[],
    transaction: TransactionResponse,
    webhook: WebhookPayload,
  ): Promise<void> {
    try {
      await notificationService.sendNotification(participants, {
        title: "Transaction Update",
        body: `Transaction ${transaction.id.substring(0, 8)}... is now in ${transaction.status} status`,
        data: {
          type: webhook.eventType,
          txId: transaction.id,
          txHash: transaction.txHash,
          status: transaction.status,
          webhookData: getBooleanEnv("SEND_WEBHOOK_DATA", false)
            ? webhook
            : null,
        },
      });
    } catch (error) {
      logger.error("Failed to send transaction notification", {
        txId: transaction.id,
        error,
      });
      throw new InternalServerError(
        "Failed to send transaction notification",
        "TRANSACTION_EVENT_ERROR",
      );
    }
  }

  /**
   * Handles events related to Embedded Wallets.
   * @throws {InternalServerError} When event processing fails
   */
  private async handleEmbeddedWalletEvent(
    webhook: WebhookPayload,
  ): Promise<void> {
    const data = webhook.data as EWBalancePayload;
    const logContext = {
      eventType: webhook.eventType,
      walletId: data.walletId,
    };

    try {
      await notificationService.sendNotification([data.walletId], {
        title: "Wallet Update",
        body: `Wallet ${data.walletId} received ${webhook.eventType} event`,
        data: { ...webhook },
      });
      logger.info("Embedded wallet notification sent successfully", logContext);
    } catch (error) {
      logger.error("Failed to handle embedded wallet event", {
        ...logContext,
        error,
      });
      throw new InternalServerError(
        "Failed to handle embedded wallet event",
        "EMBEDDED_WALLET_EVENT_ERROR",
      );
    }
  }

  /**
   * Extracts wallet IDs of all end user wallets that participate in the transaction.
   */
  private getTransactionParticipants(tx: TransactionResponse): string[] {
    const participants = new Set<string>();

    if (tx.source?.type === PeerType.END_USER_WALLET && tx.source.walletId) {
      participants.add(tx.source.walletId);
    }

    if (
      tx.destination?.type === PeerType.END_USER_WALLET &&
      tx.destination.walletId
    ) {
      participants.add(tx.destination.walletId);
    }

    if (Array.isArray(tx.destinations)) {
      tx.destinations.forEach(({ destination }) => {
        if (
          destination?.type === PeerType.END_USER_WALLET &&
          destination.walletId
        ) {
          participants.add(destination.walletId);
        }
      });
    }

    return Array.from(participants);
  }

  /**
   * Determines whether a transaction status should trigger a notification.
   */
  private isNotifiableStatus(_status: TransactionStatus): boolean {
    // TODO: Implement specific logic for notifiable statuses
    // return [TransactionStatus.PENDING_SIGNATURE, TransactionStatus.COMPLETED].includes(_status);
    return true;
  }

  /**
   * Saves webhook data to a file for audit and debugging purposes
   */
  private async saveWebhookToFile(webhook: WebhookPayload): Promise<void> {
    // Only save webhooks to file if explicitly enabled via environment variable
    const enableWebhookFileSaving = getBooleanEnv("TMP_SAVE", false);

    if (!enableWebhookFileSaving) {
      logger.debug("Webhook file saving is disabled");
      return;
    }

    try {
      const webhooksDir = join(process.cwd(), "TEMP_WEBHOOKS");
      await mkdir(webhooksDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${timestamp}-${webhook.eventType}-${webhook.resourceId || "NO_ID"}.json`;
      const filepath = join(webhooksDir, filename);

      await writeFile(filepath, JSON.stringify(webhook, null, 2), "utf-8");
      logger.info("Webhook saved to file", { filepath });
    } catch (error) {
      logger.error("Failed to save webhook to file", { error });
      // Don't throw - this is a non-critical operation
    }
  }
}

export const webhookController = new WebhookController();
