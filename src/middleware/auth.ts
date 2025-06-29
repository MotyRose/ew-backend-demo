import { NextFunction, Request, Response } from "express";
import admin from "firebase-admin";
import { logger } from "../util/logger";

// Extend Express Request interface
interface FirebaseUser {
  uid: string;
  email?: string;
}

interface RequestWithUser extends Request {
  user?: FirebaseUser;
}

export const validateFirebaseToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).send("Unauthorized");
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      res.status(401).send("Unauthorized - No token provided");
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    // Add the decoded token to the request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    logger.error("Error validating Firebase token:", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(401).send("Unauthorized");
  }
};
