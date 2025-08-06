// payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
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
  @JoinColumn({name:'order_id'})
  order: Order;
  @Column('uuid')
  order_id: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({name:'user_id'})
  user: User;
  @Column('uuid')
  user_id: string;
}
