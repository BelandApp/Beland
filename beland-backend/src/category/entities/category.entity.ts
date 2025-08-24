import { Product } from "../../products/entities/product.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'categories'})
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name:string

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Product, product => product.category)
    products: Product[] 
}
