import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Payment } from 'src/payments/entities/payment.entity';
import { Order } from 'src/orders/entities/order.entity';

@Entity('payment_types')
export class PaymentType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // Ej: FULL, SPLIT, EQUAL_SPLIT

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // Por si en el futuro desactivás un tipo

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Order, (payment) => payment.payment_type)
  orders: Order[];

  @OneToMany(() => Order, (payment) => payment.payment_type)
  carts: Order[];
}
