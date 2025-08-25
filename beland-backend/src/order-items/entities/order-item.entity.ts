// order-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'; 
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric' })
  unit_price: number;

  @Column({ type: 'numeric' })
  total_price: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({name:'order_id'})
  order: Order;
  @Column('uuid')
  order_id: string;

  @ManyToOne(() => Product, (product) => product.order_items)
  @JoinColumn({name:'product_id'})
  product: Product;
  @Column('uuid')
  product_id: string;

  // @ManyToOne(() => User, (user) => user.consumed_items, { nullable: true })
  // @JoinColumn({name:'consumed_by_user_id'})
  // consumed_by_user: User;
  // @Column('uuid')
  // consumed_by_user_id: string;
}
