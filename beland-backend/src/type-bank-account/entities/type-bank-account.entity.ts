import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'type_bank_accounts'})
export class TypeBankAccount {

    @PrimaryGeneratedColumn('uuid')
    id: string; 

    @Column('varchar')
    type_account: string;

    @CreateDateColumn ()
    created_at: Date;
}

// agregar manualmente "ahorro", "corriente"
