import { TransactionState } from "src/transaction-state/entities/transaction-state.entity";
import { TransactionType } from "src/transaction-type/entities/transaction-type.entity";
import { Wallet } from "src/wallets/entities/wallet.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;
  @Column('uuid')
  wallet_id: string;

  //type: 'RECARGA' | 'RETIRO' | 'TRANSFERENCIA' | 'COMPRA' | 'RECICLAJE' | 'DONACIÓN';
  @ManyToOne(() => TransactionType)
  @JoinColumn({ name: 'type_id' })
  type: TransactionType;
  @Column('uuid')
  type_id: string;

  // status: 'PENDING' | 'COMPLETED' | 'FAILED'
  @ManyToOne(() => TransactionState)
  @JoinColumn({ name: 'status_id' })
  status: TransactionState;
  @Column('uuid')
  status_id: string;

  @Column({ type: 'decimal',  })
  amount: number;                     // importe en Becoin (positivo o negativo según tipo)

  @Column({ type: 'numeric' })
  post_balance: number;               // saldo resultante tras la operación

  @Column({ type: 'uuid', nullable: true })
  related_wallet_id: string | null;   // para TRANSFER, id de la wallet destino

  @Column({ type: 'text', nullable: true })
  reference: string | null;           // QR, código de transacción, o nota

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}