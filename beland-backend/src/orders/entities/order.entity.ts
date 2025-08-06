// order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/users.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', default: 'PENDING_PAYMENT' })
  status: 'PENDING_PAYMENT' | 'PAID';

  @Column({ type: 'numeric', default: 0 })
  total_amount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at: Date;

  @ManyToOne(() => Group, (group) => group.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({name:'group_ip'})
  group: Group;
  @Column('uuid')
  group_id: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({name:'leader_ip'})
  leader: User;
  @Column('uuid')
  leader_id: string;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}
