import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { WithdrawAccount } from '../../withdraw-account/entities/withdraw-account.entity';
import { TransactionState } from '../../transaction-state/entities/transaction-state.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('user_withdraws')
export class UserWithdraw {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {nullable:true})
  observation: string;

  // 🔹 Usuario que solicita el retiro
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  // 🔹 Wallet desde la que se descuenta el monto
  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;
  @Column('uuid')
  wallet_id: string;

  // 🔹 Cuenta de retiro (banco o billetera)
  @ManyToOne(() => WithdrawAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'withdraw_account_id' })
  withdraw_account: WithdrawAccount;
  @Column('uuid')
  withdraw_account_id: string;

  // 🔹 Montos
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount_becoin: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount_usd: number;

  // 🔹 Estado del retiro
  @ManyToOne(() => TransactionState, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'status_id' })
  status: TransactionState;
  @Column({ type: 'uuid' })
  status_id: string;

  // 🔹 Estado del retiro
  @OneToOne(() => Transaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
  @Column({ type: 'uuid' })
  transaction_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
