import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { CartItem } from 'src/cart-items/entities/cart-item.entity';

@Entity('carts')
export class Cart { 
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'int', default: 0 })
  total_items: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  items: CartItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
