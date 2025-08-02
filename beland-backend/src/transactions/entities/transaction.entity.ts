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

  @Column({ type: 'enum', enum: ['RECHARGE','WITHDRAW','TRANSFER','PURCHASE','RECYCLE'] })
  type: 'RECHARGE' | 'WITHDRAW' | 'TRANSFER' | 'PURCHASE' | 'RECYCLE';

  @Column({ type: 'enum', enum: ['PENDING','COMPLETED','FAILED'], default: 'PENDING' })
  status: 'PENDING' | 'COMPLETED' | 'FAILED'

  @Column({ type: 'numeric' })
  amount: number;                     // importe en Becoin (positivo o negativo según tipo)

  @Column({ type: 'numeric' })
  post_balance: number;               // saldo resultante tras la operación

  @Column({ type: 'uuid', nullable: true })
  related_wallet_id: string | null;   // para TRANSFER, id de la wallet destino

  @Column({ type: 'uuid', nullable: true })
  merchant_id: string | null;         // para PURCHASE, referencia al comercio

  @Column({ type: 'text', nullable: true })
  reference: string | null;           // QR, código de transacción, o nota

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}