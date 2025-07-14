import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Subscription } from './susbscription.entity';


@Entity()
export class Refund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  stripeRefundId: string | null;

  @ManyToOne(() => Subscription, { nullable: true })
  subscription?: Subscription; 

  @Column()
  amount: number; 

  @Column()
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; 
}
