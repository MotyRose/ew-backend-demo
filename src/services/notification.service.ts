import admin from "firebase-admin";
import { In, Repository } from "typeorm";
import webpush, { PushSubscription } from "web-push";
import { AppDataSource } from "../data-source.js";
import { DeviceToken, PlatformType } from "../model/device-token.js";
import { WebPushSubscription } from "../model/web-push-subscription.js";
import { PushNotificationPayload } from "../types/fireblocks.js";
import { logger } from "../util/logger.js";

export class NotificationService {
  private deviceTokenRepo: Repository<DeviceToken>;
  private webPushRepo: Repository<WebPushSubscription>;

  constructor() {
    this.deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
    this.webPushRepo = AppDataSource.getRepository(WebPushSubscription);

    // Initialize web-push with VAPID details
    if (
      process.env.VAPID_SUBJECT &&
      process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY
    ) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
      );
      logger.info("Web Push configured with VAPID keys");
    } else {
      logger.warn("Web Push not configured", { reason: "missing VAPID keys" });
    }
  }

  /**
   * Store a device token for push notifications
   */
  async storeDeviceToken(
    userId: string,
    token: string,
    platform: PlatformType,
    walletId: string,
    deviceId?: string,
  ): Promise<DeviceToken> {
    try {
      // Check if token already exists
      let deviceToken = await this.deviceTokenRepo.findOne({
        where: { token },
      });

      if (deviceToken) {
        // Update existing token
        deviceToken.userId = userId;
        deviceToken.platform = platform;
        deviceToken.walletId = walletId;
        if (deviceId) deviceToken.deviceId = deviceId;
      } else {
        // Create new token
        deviceToken = this.deviceTokenRepo.create({
          userId,
          token,
          platform,
          walletId,
          deviceId,
        });
      }

      await this.deviceTokenRepo.save(deviceToken);
      logger.info("Device token stored", { platform, walletId });
      return deviceToken;
    } catch (error) {
      logger.error("Error storing device token", { error, walletId });
      throw error;
    }
  }

  /**
   * Store a web push subscription
   */
  async storeWebPushSubscription(
    userId: string,
    walletId: string,
    subscription: PushSubscription,
  ): Promise<WebPushSubscription> {
    try {
      // Check if subscription with the same endpoint exists
      let webPushSub = await this.webPushRepo.findOne({
        where: { endpoint: subscription.endpoint },
      });

      if (webPushSub) {
        // Update existing subscription
        webPushSub.userId = userId;
        webPushSub.walletId = walletId;
        webPushSub.auth = subscription.keys.auth;
        webPushSub.p256dh = subscription.keys.p256dh;
      } else {
        // Create new subscription
        webPushSub = this.webPushRepo.create({
          userId,
          walletId,
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
        });
      }

      await this.webPushRepo.save(webPushSub);
      logger.info("Web Push subscription stored", { walletId });
      return webPushSub;
    } catch (error) {
      logger.error("Error storing web push subscription", { error, walletId });
      throw error;
    }
  }

  /**
   * Send notification to specific users
   */
  async sendNotification(
    walletIds: string[],
    payload: PushNotificationPayload,
  ): Promise<void> {
    try {
      // Get all device tokens for these users
      const deviceTokens = await this.deviceTokenRepo.find({
        where: { walletId: In(walletIds) },
      });

      // Get all web push subscriptions for these users
      const webPushSubs = await this.webPushRepo.find({
        where: { walletId: In(walletIds) },
      });

      const notificationPromises: Promise<unknown>[] = [];

      // Send Firebase notifications (FCM)
      const fcmTokens = deviceTokens
        .filter((dt) =>
          [
            PlatformType.ANDROID,
            PlatformType.IOS,
            PlatformType.WEB_FCM,
          ].includes(dt.platform),
        )
        .map((dt) => dt.token);

      if (fcmTokens.length > 0 && admin.apps.length > 0) {
        fcmTokens.forEach((token) => {
          notificationPromises.push(
            admin.messaging().send({
              token,
              android: { priority: "high" }, // High priority for Android
              apns: {
                headers: {
                  "apns-priority": "10", // High priority for iOS
                },
                payload: {
                  aps: {
                    contentAvailable: true, // Background notification for iOS
                  },
                },
              },
              // notification: {
              //   title: payload.title,
              //   body: payload.body,
              // },
              data: this.serializeData(payload.data || {}),
            }),
          );
        });
      }

      // Send Web Push notifications
      webPushSubs.forEach((sub) => {
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh,
          },
        };

        notificationPromises.push(
          webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: payload.title,
              body: payload.body,
              ...payload.data,
            }),
          ),
        );
      });

      // Wait for all notifications to be sent
      if (notificationPromises.length > 0) {
        logger.info("Sending notifications", {
          walletIds,
          notificationCount: notificationPromises.length,
        });

        const results = await Promise.allSettled(notificationPromises);

        // Log any failures
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            logger.error("Failed to send notification", {
              error: result.reason,
              index,
            });
            // TODO: Handle specific error cases and delete tokens if necessary
            // For example, if the error is an invalid token, you might want to remove it
            // this.deviceTokenRepo.delete({ token: fcmTokens[index] });
          } else {
            logger.info("Notification sent successfully", {
              index,
              fcmToken: fcmTokens[index],
              result: result.value,
            });
          }
        });
      } else {
        logger.info("No notification channels available", {
          walletIds,
        });
      }
    } catch (error) {
      logger.error("Error sending notifications", { error, walletIds });
      throw error;
    }
  }

  /**
   * Serialize notification data to ensure all values are strings as required by Firebase
   */
  private serializeData(
    data: Record<string, string | number | boolean | object | null>,
  ): Record<string, string> {
    const serialized: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      serialized[key] =
        typeof value === "string" ? value : JSON.stringify(value);
    }

    return serialized;
  }
}

export const notificationService = new NotificationService();
