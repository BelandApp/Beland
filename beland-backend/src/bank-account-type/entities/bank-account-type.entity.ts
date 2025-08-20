import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BankAccount } from 'src/bank-account/entities/bank-account.entity';

@Entity('bank_account_types')
export class BankAccountType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Código único del tipo: AHORRO, CORRIENTE */
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  /** Nombre legible: Cuenta de Ahorro o Cuenta Corriente */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Descripción opcional para la UI */
  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => BankAccount, (account) => account.account_type)
  bank_accounts: BankAccount[];
}
