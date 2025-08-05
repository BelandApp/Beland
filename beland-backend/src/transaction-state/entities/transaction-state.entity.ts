import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity'; 

@Entity('transaction_states')
export class TransactionState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Código único: PENDING, COMPLETED, FAILED */
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  /** Nombre legible: Pendiente, Completada, Fallida */
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
  @OneToMany(() => Transaction, (transaction) => transaction.status)
  transactions: Transaction[];
}
