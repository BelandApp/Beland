// src/products/entities/product.entity.ts
import { Category } from 'src/category/entities/category.entity';
import { GroupType } from 'src/group-type/entities/group-type.entity';
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
  ManyToMany,
  JoinTable,
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

  @ManyToMany(() => GroupType, (groupType) => groupType.products)
  @JoinTable({
    name: 'product_group_types', // nombre de la tabla intermedia
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_type_id', referencedColumnName: 'id' },
  })
  group_types: GroupType[];

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
