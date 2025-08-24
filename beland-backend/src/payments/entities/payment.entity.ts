// payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/users.entity';
import { PaymentType } from '../../payment-types/entities/payment-type.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric' })
  amount_paid: number;

  @Column({ type: 'text', nullable: true })
  transaction_hash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  @JoinColumn({name:'order_id'})
  order: Order;
  @Column('uuid')
  order_id: string;

  @ManyToOne(() => PaymentType)
  @JoinColumn({name:'payment_type_id'})
  payment_type: PaymentType;
  @Column('uuid')
  payment_type_id: string;

  @ManyToOne(() => Transaction)
  @JoinColumn({name:'transaction_id'})
  transaction: Transaction;
  @Column('uuid')
  transaction_id: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({name:'user_id'})
  user: User;
  @Column('uuid')
  user_id: string;
}
