import crypto from "crypto";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { logger } from "../util/logger.js";

export const validateWebhookSignature: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const signature = req.headers["fireblocks-signature"];

    if (!signature || typeof signature !== "string") {
      logger.warn("Missing webhook signature", { signature });
      res.status(401).json({ error: "Missing signature" });
      return;
    }

    // const publicKey = getEnvOrThrow("FIREBLOCKS_WEBHOOK_PUBLIC_KEY").replace(/\\n/g, "\n");
    const webhookPublicKey = process.env.FIREBLOCKS_WEBHOOK_PUBLIC_KEY;
    if (
      !webhookPublicKey ||
      !webhookPublicKey.startsWith("-----BEGIN PUBLIC KEY-----")
    ) {
      logger.error("Invalid webhook public key configuration", {
        webhookPublicKey,
      });
      res.status(500).json({ error: "Webhook not properly configured" });
      return;
    }
    const publicKey = webhookPublicKey.replace(/\\n/g, "\n");

    // Get the raw body as string
    const rawBody = JSON.stringify(req.body);

    try {
      // Verify the signature
      const verify = crypto.createVerify("SHA512");
      verify.update(rawBody);

      const isValid = verify.verify(publicKey, signature, "base64");

      if (!isValid) {
        logger.warn("Invalid webhook signature", { signature });
        res.status(401).json({ error: "Invalid signature" });
        return;
      }

      next();
    } catch (error) {
      logger.error("Error validating webhook signature", { error });
      res.status(401).json({ error: "Invalid signature format" });
      return;
    }
  } catch (error) {
    logger.error("Error in webhook middleware", { error });
    next(error);
  }
};
