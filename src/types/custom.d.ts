// Type declarations for modules without type definitions

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    PORT: string;
    LOG_LEVEL?: string;

    // Database
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;

    // Authentication
    JWKS_URI: string;
    ISSUER: string;
    AUDIENCE: string;

    // Push Notifications
    VAPID_SUBJECT: string;
    VAPID_PUBLIC_KEY: string;
    VAPID_PRIVATE_KEY: string;
    FIREBASE_SERVICE_ACCOUNT_PATH?: string;

    // CORS Origins
    ORIGIN_WEB_SDK: string;
  }
}
