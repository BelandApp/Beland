import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Entity('transaction_types')
export class TransactionType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Código único del tipo: RECHARGE, WITHDRAW, TRANSFER, PURCHASE, RECYCLE, DONATION */
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  /** Nombre legible: Recarga, Retiro, Transferencia, etc. */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Descripción opcional para la UI */
  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  /** Relación inversa con Transaction */
  @OneToMany(() => Transaction, (transaction) => transaction.type)
  transactions: Transaction[];
}
