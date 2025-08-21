import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WithdrawAccount } from 'src/withdraw-account/entities/withdraw-account.entity';

@Entity('withdraw_account_types')
export class WithdrawAccountType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string; // Ej: BANK, WALLET

  @Column({ type: 'varchar' })
  name: string; // Ej: Cuenta Bancaria, Billetera Virtual

  /** Descripción opcional para la UI */
  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => WithdrawAccount, (account) => account.type)
  withdraw_accounts: WithdrawAccount[];
}
