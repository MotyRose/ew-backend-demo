import { NextFunction, Request, RequestHandler, Response } from "express";
import { UnauthorizedError } from "../errors/api.errors.js";
import { logger } from "../util/logger.js";

/**
 * Base controller providing common functionality for all controllers
 */
export abstract class BaseController {
  /**
   * Wraps request handlers with standard error handling and response formatting
   */
  protected handleRequest(
    handler: (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<void> | void,
  ): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        logger.error("Request handler error", {
          error,
          path: req.path,
          method: req.method,
          userId: req.auth?.payload.sub,
        });
        next(error);
      }
    };
  }

  /**
   * Standardized success response
   */
  protected sendResponse<T>(
    res: Response,
    data: T,
    status: number = 200,
  ): void {
    res.status(status).json({
      success: true,
      data,
    });
  }

  /**
   * Standardized error response
   */
  protected sendError(
    res: Response,
    error: string,
    status: number = 400,
  ): void {
    res.status(status).json({
      success: false,
      error,
    });
  }

  /**
   * Checks if request is authenticated
   */
  protected requireAuth(req: Request): void {
    if (!req.auth?.payload.sub) {
      throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    }
  }
}
