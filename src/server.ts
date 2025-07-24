import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import { createApp } from "./app.js";
import { AppDataSource } from "./data-source.js";
import { logger } from "./util/logger.js";

// Load environment variables
dotenv.config();
console.log("ENVIRONMENT:", process.env);

async function initializeApp(): Promise<void> {
  try {
    // Initialize Firebase Admin if credentials are provided
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
        ) as admin.ServiceAccount;
      } catch (e) {
        logger.error(
          "Invalid Firebase service account JSON in environment variable",
          { error: e },
        );
        throw e;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      logger.info(
        "Firebase Admin SDK initialized from JSON environment variable",
      );
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(
          fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8"),
        ) as admin.ServiceAccount;
      } catch (e) {
        logger.error("Invalid Firebase service account JSON file", {
          error: e,
        });
        throw e;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      logger.info("Firebase Admin SDK initialized from file");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Or use credentials file
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      logger.info(
        "Firebase Admin SDK initialized with application default credentials",
      );
    } else {
      logger.warn("Firebase Admin SDK not initialized", {
        reason: "Missing credentials",
      });
    }

    // Initialize database connection
    await AppDataSource.initialize();
    logger.info("Database connection initialized");

    // Create and start Express app
    const port = parseInt(process.env.PORT || "3000", 10);
    const app = createApp({
      jwksUri: process.env.JWKS_URI,
      issuer: process.env.ISSUER,
      audience: process.env.AUDIENCE,
    });

    app.listen(port, () => {
      logger.info("Server running", { port });
    });
  } catch (error) {
    logger.error("Failed to initialize application", {
      error,
      stack: error instanceof Error ? error.stack : "No stack trace available",
    });
    process.exit(1);
  }
}

// Start the application
initializeApp().catch((error) => {
  logger.error("Unhandled error during initialization", { error });
  process.exit(1);
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled rejection", { error });
  process.exit(1);
});
