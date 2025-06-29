import { Router } from "express";
import { webhookController } from "../controllers/webhook.controller.js";
import { validateWebhookSignature } from "../middleware/webhook.js";

/**
 * Creates webhook routes
 */
export function createWebhookRoutes(): Router {
  const router = Router();

  // Webhook endpoint with signature validation
  router.post(
    "/",
    validateWebhookSignature,
    webhookController.handleWebhookEvent(),
  );

  return router;
}
