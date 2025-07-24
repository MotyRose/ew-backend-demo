import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableColumn } from "typeorm";

export class CreateTables1746700230000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const dbType = queryRunner.connection.options.type;

    // Database-specific configurations
    const isPostgres = dbType === "postgres";
    const idColumn = isPostgres
      ? { type: "uuid" as const, generationStrategy: "uuid" as const }
      : {
          type: "varchar" as const,
          length: "36",
          generationStrategy: "uuid" as const,
        };

    const timestampDefault = isPostgres ? "NOW()" : "CURRENT_TIMESTAMP";

    // Create device_tokens table
    await queryRunner.createTable(
      new Table({
        name: "device_tokens",
        columns: [
          {
            name: "id",
            ...idColumn,
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "userId",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "token",
            type: "varchar",
            length: "512",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "platform",
            type: "enum",
            enum: ["android", "ios", "web-fcm", "web-push"],
            ...(isPostgres && { enumName: "device_token_platform_enum" }),
            isNullable: false,
          },
          {
            name: "walletId",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "deviceId",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: timestampDefault,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: timestampDefault,
            ...(!isPostgres && { onUpdate: "CURRENT_TIMESTAMP" }),
          },
        ],
        indices: [
          {
            name: "idx_device_tokens_user_id",
            columnNames: ["userId"],
          },
          {
            name: "idx_device_tokens_wallet_id",
            columnNames: ["walletId"],
          },
          {
            name: "idx_device_tokens_token",
            columnNames: ["token"],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    // Create web_push_subscriptions table
    await queryRunner.createTable(
      new Table({
        name: "web_push_subscriptions",
        columns: [
          {
            name: "id",
            ...idColumn,
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "userId",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "endpoint",
            type: "varchar",
            length: "512",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "auth",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "p256dh",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "walletId",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: timestampDefault,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: timestampDefault,
            ...(!isPostgres && { onUpdate: "CURRENT_TIMESTAMP" }),
          },
        ],
        indices: [
          {
            name: "idx_web_push_subscriptions_user_id",
            columnNames: ["userId"],
          },
          {
            name: "idx_web_push_subscriptions_wallet_id",
            columnNames: ["walletId"],
          },
          {
            name: "idx_web_push_subscriptions_endpoint",
            columnNames: ["endpoint"],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    // For PostgreSQL, create triggers for auto-updating updatedAt timestamp
    if (isPostgres) {
      await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updatedAt" = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      await queryRunner.query(`
        CREATE TRIGGER update_device_tokens_updated_at 
        BEFORE UPDATE ON device_tokens 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      await queryRunner.query(`
        CREATE TRIGGER update_web_push_subscriptions_updated_at 
        BEFORE UPDATE ON web_push_subscriptions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const dbType = queryRunner.connection.options.type;
    const isPostgres = dbType === "postgres";

    // For PostgreSQL, drop triggers and functions first
    if (isPostgres) {
      await queryRunner.query(
        `DROP TRIGGER IF EXISTS update_web_push_subscriptions_updated_at ON web_push_subscriptions;`,
      );
      await queryRunner.query(
        `DROP TRIGGER IF EXISTS update_device_tokens_updated_at ON device_tokens;`,
      );
      await queryRunner.query(
        `DROP FUNCTION IF EXISTS update_updated_at_column();`,
      );
    }

    // Drop tables
    await queryRunner.dropTable("web_push_subscriptions");
    await queryRunner.dropTable("device_tokens");

    // For PostgreSQL, drop custom enum types
    if (isPostgres) {
      await queryRunner.query(
        `DROP TYPE IF EXISTS device_token_platform_enum;`,
      );
    }
  }
}
