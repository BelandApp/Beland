import { User } from '../../users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('amount_to_payment')
export class AmountToPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_commerce_id' })
  user_commerce: User;
  @Column({ type: 'uuid' })
  user_commerce_id: string

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number; 

  @Column({ type: 'varchar', nullable:true })
  message?: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}

