import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { AuthOptions, checkJwt } from "../middleware/jwt.js";

/**
 * Creates notification routes
 * @param authOpts JWT authentication options
 */
export function createNotificationRoutes(authOpts: AuthOptions): Router {
  const router = Router();

  // Register device token (secured)
  router.post(
    "/register-token",
    checkJwt(authOpts),
    notificationController.registerDeviceToken(),
  );

  // Register web push subscription (secured)
  router.post(
    "/register-subscription",
    checkJwt(authOpts),
    notificationController.registerWebPushSubscription(),
  );

  // Get VAPID public key for web push (public)
  router.get("/vapid-public-key", notificationController.getVapidPublicKey());

  return router;
}
