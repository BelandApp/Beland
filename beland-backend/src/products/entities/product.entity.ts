// src/products/entities/product.entity.ts
import { Category } from 'src/category/entities/category.entity';
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
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  cost: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @ManyToOne (() => Category, (cate) => cate.products)
  @JoinColumn({name: 'category_id'})
  category: Category
  @Column('uuid', {nullable:true}) 
  category_id: string;

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
