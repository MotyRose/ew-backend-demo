import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateTables1746700230000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create device_tokens table
    await queryRunner.createTable(
      new Table({
        name: "device_tokens",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
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
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
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
            type: "varchar",
            length: "36",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
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
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("web_push_subscriptions");
    await queryRunner.dropTable("device_tokens");
  }
}
