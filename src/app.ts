import express from "express";
import rateLimit from "express-rate-limit";
import type {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express-serve-static-core";
import helmet from "helmet";
import { createRemoteJWKSet, JWTVerifyGetKey } from "jose";
import { ApiError, InternalServerError } from "./errors/api.errors.js";
import { AuthOptions as JwtAuthOptions } from "./middleware/jwt.js";
import { createNotificationRoutes } from "./routes/notification.route.js";
import { createWebhookRoutes } from "./routes/webhook.route.js";
import { logger } from "./util/logger.js";

export interface AppAuthOptions {
  jwksUri: string;
  issuer: string;
  audience: string;
}

export function createApp(authOpts: AppAuthOptions): Express {
  const app = express();

  // Add security headers
  app.use(helmet());

  // TODO: Configure CORS
  // const origins =
  //   process.env.ORIGIN_WEB_SDK?.split(",").map((url) => url.trim()) || [];
  // app.use(
  //   cors({
  //     origin: origins,
  //     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  //     allowedHeaders: [
  //       "Content-Type",
  //       "Authorization",
  //       "x-request-id",
  //       "fireblocks-signature",
  //     ],
  //     credentials: true,
  //     maxAge: 600,
  //   }),
  // );

  // Add rate limiting (except for webhooks)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith("/api/webhook"), // Skip webhooks
  });
  app.use("/api/", apiLimiter);

  // Request parsing with raw body access for webhook validation
  app.use(
    express.json({
      limit: "1mb",
      verify: (req: Request, _res: Response, buf: Buffer) => {
        // Store raw body for webhook signature verification
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Add request logging
  app.use((req: Request, res: Response, next: NextFunction): void => {
    // Skip logging for health check route
    if (req.originalUrl === "/" || req.path === "/") {
      next();
      return;
    }

    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms \n`;

      // Log message based on status code
      if (res.statusCode >= 500) {
        logger.error(message);
      } else if (res.statusCode >= 400) {
        logger.warn(message);
      } else {
        logger.info(message);
      }
    });

    next();
  });

  // Create JWT verification options
  const JWKS = createRemoteJWKSet(new URL(authOpts.jwksUri));

  const jwtAuthOpts: JwtAuthOptions = {
    verify: {
      issuer: authOpts.issuer,
      audience: authOpts.audience,
    },
    key: JWKS as JWTVerifyGetKey,
  };

  // Health check route
  app.get("/", (req: Request, res: Response) => {
    res.send("OK");
  });

  // API Routes
  const notificationRouter = createNotificationRoutes(jwtAuthOpts);
  const webhookRouter = createWebhookRoutes();

  // Use type assertion to handle Router middleware
  app.use(
    "/api/notifications",
    notificationRouter as unknown as RequestHandler,
  );
  app.use("/api/webhook", webhookRouter as unknown as RequestHandler);

  // Global error handling middleware
  app.use(
    (
      err: Error | ApiError,
      req: Request,
      res: Response,
      _next: NextFunction,
    ): void => {
      // Create structured error information
      const errorContext = {
        path: req.path,
        method: req.method,
        requestId: req.requestId,
        error: {
          name: err.name,
          message: err.message,
          stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
        },
      };

      // Log error with context
      logger.error("Request error", errorContext);

      // Convert to ApiError if needed
      const apiError =
        err instanceof ApiError
          ? err
          : new InternalServerError(
              process.env.NODE_ENV !== "production"
                ? err.message
                : "Internal Server Error",
            );

      // Define type-safe error response structure
      interface ErrorResponse {
        error: string;
        code?: string;
        requestId?: string;
      }

      // Build error response with optional fields
      const errorResponse: ErrorResponse = {
        error: apiError.message,
        ...(apiError.errorCode && { code: apiError.errorCode }),
        ...(req.requestId && { requestId: req.requestId }),
      };

      // Send error response
      res.status(apiError.statusCode).json(errorResponse);
    },
  );

  return app;
}
