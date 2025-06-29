import { Request, RequestHandler } from "express";
import { JWTVerifyGetKey, JWTVerifyOptions, jwtVerify } from "jose";
import { logger } from "../util/logger.js";

// Define JWT payload interface
interface JWTPayload {
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

// Define auth property type
interface RequestAuth {
  token: string;
  payload: JWTPayload;
}

// Extend Express Request type
declare module "express-serve-static-core" {
  interface Request {
    auth?: RequestAuth;
  }
}

export interface AuthOptions {
  verify: JWTVerifyOptions;
  key: JWTVerifyGetKey;
}

function extractToken(req: Request): string | null {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }

  if (req.query.token && typeof req.query.token === "string") {
    return req.query.token;
  }

  return null;
}

export const checkJwt = (options: AuthOptions): RequestHandler => {
  const middleware: RequestHandler = async (req, res, next) => {
    try {
      const token = extractToken(req);

      if (!token) {
        logger.warn("Authentication failed", {
          reason: "Missing authentication token",
        });
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      try {
        const { payload } = await jwtVerify(token, options.key, options.verify);

        // Add auth context to request
        req.auth = {
          token,
          payload: payload as JWTPayload,
        };

        next();
      } catch (error) {
        logger.warn("Invalid authentication token", { error });
        res.status(401).json({ error: "Invalid authentication token" });
        return;
      }
    } catch (error) {
      logger.error("Error in JWT middleware", { error });
      next(error);
    }
  };

  return middleware;
};
