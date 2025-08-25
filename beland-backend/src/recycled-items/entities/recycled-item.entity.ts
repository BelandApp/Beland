// recycled-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/users.entity';

@Entity('recycled_items')
export class RecycledItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  is_redeemed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  redeemed_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({name: 'product_id'})
  product: Product;
  @Column('uuid')
  product_id: string

  @ManyToOne(() => User, (user) => user.scanned_items, { nullable: false })
  @JoinColumn({name: 'scanned_by_user_id'})
  scanned_by_user: User;
  @Column('uuid')
  scanned_by_user_id: string
}
