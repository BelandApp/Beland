import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity'; 
import { Order } from 'src/orders/entities/order.entity';

@Entity('user_addresses')
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, /*user => user.addresses,*/ { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: string;

  @Column({ length: 150 })
  addressLine1: string; // Calle principal, número

  @Column({ length: 150, nullable: true })
  addressLine2?: string; // Referencia, calle secundaria

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100, nullable: true })
  state?: string; // Provincia / estado

  @Column({ length: 100 })
  country: string; // Ecuador, etc.

  @Column({ length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @Column({ default: false })
  isDefault: boolean; // Marcar dirección principal

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date; // Soft delete

  @OneToMany(() => Order, (order) => order.address)
  orders: Order[];
}
