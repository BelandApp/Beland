// users.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Group } from 'src/groups/entities/group.entity';
import { GroupMember } from 'src/group-members/entities/group-member.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Action } from 'src/actions/entities/action.entity';
import { RecycledItem } from 'src/recycled-items/entities/recycled-item.entity';
import { PrizeRedemption } from 'src/prize-redemptions/entities/prize-redemption.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  oauth_provider: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  username: string;

  @Column({ type: 'text', nullable: true })
  full_name: string;

  @Column({ type: 'text', nullable: true })
  profile_picture_url: string;

  @Column({ type: 'numeric', default: 0 })
  current_balance: number;

  @Column({ type: 'text', default: 'USER' })
  role: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN';

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @OneToMany(() => Group, (group) => group.leader)
  led_groups: Group[];

  @OneToMany(() => GroupMember, (member) => member.user)
  group_memberships: GroupMember[];

  @OneToMany(() => Order, (order) => order.leader)
  orders: Order[];

  @OneToMany(() => OrderItem, (item) => item.consumed_by_user)
  consumed_items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Action, (action) => action.user)
  actions: Action[];

  @OneToMany(() => RecycledItem, (item) => item.scanned_by_user)
  scanned_items: RecycledItem[];

  @OneToMany(() => PrizeRedemption, (redemption) => redemption.user)
  prize_redemptions: PrizeRedemption[];

  @OneToMany(() => Coupon, (coupon) => coupon.redeemed_by_user)
  redeemed_coupons: Coupon[];
}
