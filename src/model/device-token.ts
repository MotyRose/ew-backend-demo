import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum PlatformType {
  ANDROID = "android",
  IOS = "ios",
  WEB_FCM = "web-fcm",
  WEB_PUSH = "web-push",
}

@Entity("device_tokens")
export class DeviceToken extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ length: 512 })
  @Index({ unique: true })
  token: string;

  @Column({
    type: "enum",
    enum: PlatformType,
  })
  platform: PlatformType;

  @Column()
  @Index()
  walletId: string;

  @Column({ nullable: true })
  deviceId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
