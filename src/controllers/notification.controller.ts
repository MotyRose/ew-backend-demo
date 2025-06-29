import type { Request, RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import type { PushSubscription } from "web-push";
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "../errors/api.errors.js";
import type { DeviceToken } from "../model/device-token.js";
import { PlatformType } from "../model/device-token.js";
import type { WebPushSubscription } from "../model/web-push-subscription.js";
import { notificationService } from "../services/notification.service.js";
import { logger } from "../util/logger.js";
import { BaseController } from "./base.controller.js";

// Enhanced type definitions with validation
interface RegisterDeviceTokenBody {
  token: string;
  platform: PlatformType;
  walletId: string;
  deviceId?: string;
}

interface RegisterWebPushBody {
  subscription: PushSubscription;
  walletId: string;
}

type DeviceTokenResponse = Pick<
  DeviceToken,
  "id" | "userId" | "platform" | "walletId" | "deviceId"
>;

type WebPushResponse = Pick<WebPushSubscription, "id" | "userId" | "endpoint">;

/**
 * Controller handling notification-related endpoints including device token
 * registration and web push subscription management.
 */
export class NotificationController extends BaseController {
  /**
   * Register a device token for push notifications
   * @throws {UnauthorizedError} When user is not authenticated
   * @throws {BadRequestError} When input validation fails
   */
  registerDeviceToken(): RequestHandler {
    return this.handleRequest(
      async (
        req: Request<
          ParamsDictionary,
          unknown,
          Partial<RegisterDeviceTokenBody>
        >,
        res,
      ) => {
        this.requireAuth(req);

        const userId = this.validateUserId(req.auth?.payload.sub);
        const deviceTokenData = this.validateDeviceTokenInput(req.body);

        const deviceToken = await notificationService.storeDeviceToken(
          userId,
          deviceTokenData.token,
          deviceTokenData.platform,
          deviceTokenData.walletId,
          deviceTokenData.deviceId,
        );

        logger.info("Device token registered", {
          id: deviceToken.id,
          userId,
          platform: deviceTokenData.platform,
        });

        const response: DeviceTokenResponse = {
          id: deviceToken.id,
          userId: deviceToken.userId,
          platform: deviceToken.platform,
          walletId: deviceToken.walletId,
          deviceId: deviceToken.deviceId,
        };

        this.sendResponse(res, response);
      },
    );
  }

  /**
   * Register a web push subscription
   * @throws {UnauthorizedError} When user is not authenticated
   * @throws {BadRequestError} When input validation fails
   */
  registerWebPushSubscription(): RequestHandler {
    return this.handleRequest(
      async (
        req: Request<ParamsDictionary, unknown, Partial<RegisterWebPushBody>>,
        res,
      ) => {
        this.requireAuth(req);

        const userId = this.validateUserId(req.auth?.payload.sub);
        const webPushData = this.validateWebPushInput(req.body);

        const webPushSubscription =
          await notificationService.storeWebPushSubscription(
            userId,
            webPushData.walletId,
            webPushData.subscription,
          );

        logger.info("Web push subscription registered", {
          id: webPushSubscription.id,
          userId,
          platform: PlatformType.WEB_PUSH,
          endpoint: webPushSubscription.endpoint,
        });

        const response: WebPushResponse = {
          id: webPushSubscription.id,
          userId: webPushSubscription.userId,
          endpoint: webPushSubscription.endpoint,
        };

        this.sendResponse(res, response);
      },
    );
  }

  /**
   * Get VAPID public key for web push setup
   * @throws {InternalServerError} When VAPID key is not configured
   */
  getVapidPublicKey(): RequestHandler {
    return this.handleRequest((req, res) => {
      const publicKey = process.env.VAPID_PUBLIC_KEY;

      if (!publicKey) {
        const error = new InternalServerError(
          "Push notifications are not properly configured",
          "MISSING_VAPID_PUBLIC_KEY",
        );

        logger.error("VAPID configuration error", {
          error,
          path: req.path,
        });

        throw error;
      }

      this.sendResponse(res, { publicKey });
    });
  }

  private validateUserId(userId: string | undefined): string {
    if (!userId) {
      throw new UnauthorizedError(
        "User ID not found in token",
        "AUTH_NO_USER_ID",
      );
    }
    return userId;
  }

  private validateDeviceTokenInput(
    input: Partial<RegisterDeviceTokenBody>,
  ): RegisterDeviceTokenBody {
    const { token, platform, walletId, deviceId } = input;

    if (!token || typeof token !== "string") {
      throw new BadRequestError(
        "Token is required and must be a string",
        "INVALID_TOKEN",
      );
    }

    if (
      !platform ||
      typeof platform !== "string" ||
      !Object.values(PlatformType).includes(platform)
    ) {
      throw new BadRequestError("Invalid platform type", "INVALID_PLATFORM");
    }

    if (!walletId || typeof walletId !== "string") {
      throw new BadRequestError(
        "WalletId is required and must be a string",
        "INVALID_WALLET_ID",
      );
    }

    if (deviceId !== undefined && typeof deviceId !== "string") {
      throw new BadRequestError(
        "DeviceId must be a string",
        "INVALID_DEVICE_ID",
      );
    }

    return { token, platform, walletId, deviceId };
  }

  private isValidSubscription(value: unknown): value is PushSubscription {
    if (!value || typeof value !== "object") return false;
    const sub = value as Partial<PushSubscription>;
    return Boolean(
      sub.endpoint &&
        typeof sub.endpoint === "string" &&
        sub.keys &&
        typeof sub.keys.auth === "string" &&
        typeof sub.keys.p256dh === "string",
    );
  }

  private validateWebPushInput(
    input: Partial<RegisterWebPushBody>,
  ): RegisterWebPushBody {
    const { subscription, walletId } = input;

    if (!this.isValidSubscription(subscription)) {
      throw new BadRequestError(
        "Invalid subscription format",
        "INVALID_SUBSCRIPTION",
      );
    }

    if (!walletId || typeof walletId !== "string") {
      throw new BadRequestError(
        "WalletId is required and must be a string",
        "INVALID_WALLET_ID",
      );
    }

    return { subscription, walletId };
  }
}

export const notificationController = new NotificationController();
