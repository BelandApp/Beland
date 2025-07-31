// coupon.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  code: string;

  @Column({ type: 'text' })
  type: 'DISCOUNT' | 'BONUS_COINS';

  @Column({ type: 'numeric' })
  value: number;

  @Column({ type: 'boolean', default: false })
  is_redeemed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  redeemed_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.redeemed_coupons, { nullable: true })
  @JoinColumn({name: 'redeemed_by_user_id'})
  redeemed_by_user: User;
  @Column('uuid', { nullable: true } )
  redeemed_by_user_id: string;
}
