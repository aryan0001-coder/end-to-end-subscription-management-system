import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  stripePriceId: string;

  @Column()
  name: string;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column()
  interval: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
