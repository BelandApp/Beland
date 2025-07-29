// payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/users.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric' })
  amount_paid: number;

  @Column({ type: 'text' })
  payment_type: 'FULL' | 'SPLIT' | 'EQUAL_SPLIT';

  @Column({ type: 'text', nullable: true })
  transaction_hash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  payment_date: Date;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;
}
