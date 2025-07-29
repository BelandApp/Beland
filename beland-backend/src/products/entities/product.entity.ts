// product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { InventoryItem } from 'src/inventory-items/entities/inventory-item.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { RecycledItem } from 'src/recycled-items/entities/recycled-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  category: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => InventoryItem, (inventory) => inventory.product)
  inventory_items: InventoryItem[];

  @OneToMany(() => OrderItem, (item) => item.product)
  order_items: OrderItem[];

  @OneToMany(() => RecycledItem, (item) => item.product)
  recycled_items: RecycledItem[];
}
