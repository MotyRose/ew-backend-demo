import { JWTPayload } from "jose";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        payload: JWTPayload;
        protectedHeader: {
          alg: string;
          kid: string;
        };
      };
      rawBody?: Buffer;
      requestId?: string;
    }
  }
}

export {};
