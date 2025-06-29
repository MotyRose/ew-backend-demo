import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("web_push_subscriptions")
export class WebPushSubscription extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ length: 512 })
  @Index({ unique: true })
  endpoint: string;

  @Column()
  auth: string;

  @Column()
  p256dh: string;

  @Column()
  @Index()
  walletId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
