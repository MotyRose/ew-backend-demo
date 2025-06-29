import "dotenv/config";
import path from "path";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import { DeviceToken } from "./model/device-token.js";
import { WebPushSubscription } from "./model/web-push-subscription.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "ew_demo",
  synchronize: false, // Always false to ensure migrations are used
  logging: process.env.NODE_ENV !== "production",
  entities: [DeviceToken, WebPushSubscription],
  migrations: [path.join(__dirname, "/migrations/*.{ts,js}")],
  migrationsRun: true, // Automatically run migrations on startup
  subscribers: [],
});
