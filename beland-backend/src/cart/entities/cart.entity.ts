import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { CartItem } from 'src/cart-items/entities/cart-item.entity';
import { UserAddress } from 'src/user-address/entities/user-address.entity';
import { Group } from 'src/groups/entities/group.entity';
import { PaymentType } from 'src/payment-types/entities/payment-type.entity';

@Entity('carts')
export class Cart { 
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string; 

  @ManyToOne(() => UserAddress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address: UserAddress;
  @Column('uuid', {nullable:true})
  address_id: string;

  @ManyToOne(() => Group, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({name:'group_ip'})
  group: Group;
  @Column('uuid', { nullable:true })
  group_id: string;

  // payments_type: 'FULL' | 'EQUAL_SPLIT';
  @ManyToOne(() => PaymentType, (type) => type.carts, { eager: true })
  @JoinColumn({ name: 'payment_type_id' })
  payment_type: PaymentType;
  @Column({ type: 'uuid' , nullable:true })
  payment_type_id: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
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
