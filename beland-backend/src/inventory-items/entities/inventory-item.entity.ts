// inventory-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  quantity_available: number;

  @Column({ type: 'text', nullable: true })
  offer_label: string;

  @Column({ type: 'timestamptz', nullable: true })
  promotion_expires_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Product, (product) => product.inventory_items, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
