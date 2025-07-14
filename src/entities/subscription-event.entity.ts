import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Subscription } from './susbscription.entity';

@Entity()
export class SubscriptionEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription)
  subscription: Subscription;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  eventData: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
