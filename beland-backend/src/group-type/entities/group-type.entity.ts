import { Product } from "src/products/entities/product.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'groups-type'})
export class GroupType {

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('varchar')
    name:string;

    @CreateDateColumn()
    created_at:Date;

    @ManyToMany(() => Product, (product) => product.group_types)
    products: Product[];

}
