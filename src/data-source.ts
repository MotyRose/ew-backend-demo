import "dotenv/config";
import path from "path";
import { DataSource, DataSourceOptions } from "typeorm";
import { fileURLToPath } from "url";
import { DeviceToken } from "./model/device-token.js";
import { WebPushSubscription } from "./model/web-push-subscription.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database type configuration - defaults to MySQL for backward compatibility
const DB_TYPE = (process.env.DB_TYPE as "mysql" | "postgres") || "mysql";

// Parse DATABASE_URL connection string if provided
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || (DB_TYPE === "mysql" ? 3306 : 5432),
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1), // Remove leading slash
    };
  } catch (error) {
    console.warn("Failed to parse DATABASE_URL:", error);
    return null;
  }
}

// Common configuration for both database types
const commonConfig = {
  synchronize: false, // Always false to ensure migrations are used
  logging: process.env.NODE_ENV !== "production",
  entities: [DeviceToken, WebPushSubscription],
  migrations: [path.join(__dirname, "/migrations/*.{ts,js}")],
  migrationsRun: true, // Automatically run migrations on startup
  subscribers: [],
};

// Parse DATABASE_URL or use individual environment variables
const databaseUrlParsed = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : null;

// Database-specific configurations
const databaseConfigs: Record<
  "mysql" | "postgres",
  Partial<DataSourceOptions>
> = {
  mysql: {
    type: "mysql",
    host: databaseUrlParsed?.host || process.env.DB_HOST || "localhost",
    port: databaseUrlParsed?.port || Number(process.env.DB_PORT) || 3306,
    username: databaseUrlParsed?.username || process.env.DB_USERNAME || "root",
    password: databaseUrlParsed?.password || process.env.DB_PASSWORD,
    database: databaseUrlParsed?.database || process.env.DB_NAME || "ew_demo",
  },
  postgres: {
    type: "postgres",
    host: databaseUrlParsed?.host || process.env.DB_HOST || "localhost",
    port: databaseUrlParsed?.port || Number(process.env.DB_PORT) || 5432,
    username:
      databaseUrlParsed?.username || process.env.DB_USERNAME || "postgres",
    password: databaseUrlParsed?.password || process.env.DB_PASSWORD,
    database: databaseUrlParsed?.database || process.env.DB_NAME || "ew_demo",
    // SSL configuration for cloud PostgreSQL providers (Render, Heroku, etc.)
    ssl:
      process.env.NODE_ENV === "production" && process.env.DB_SSL !== "false"
        ? { rejectUnauthorized: false }
        : false,
  },
};

// Create DataSource with selected database configuration
export const AppDataSource = new DataSource({
  ...commonConfig,
  ...databaseConfigs[DB_TYPE],
} as DataSourceOptions);
