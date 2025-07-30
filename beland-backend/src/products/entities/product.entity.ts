// src/products/entities/product.entity.ts
import { InventoryItem } from 'src/inventory-items/entities/inventory-item.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { RecycledItem } from 'src/recycled-items/entities/recycled-item.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

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

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  // Relaciones ...
  @OneToMany(() => InventoryItem, (inventory) => inventory.product)
  inventory_items: InventoryItem[];

  @OneToMany(() => OrderItem, (item) => item.product)
  order_items: OrderItem[];

  @OneToMany(() => RecycledItem, (item) => item.product)
  recycled_items: RecycledItem[];
}
