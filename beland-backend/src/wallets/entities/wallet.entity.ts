// wallet.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { BankAccount } from 'src/bank-account/entities/bank-account.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  alias: string;

  @Column({ type: 'text', nullable: true })
  qr: string;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  becoin_balance: number;             // saldo disponible en Becoin

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  locked_balance: number;             // opcional: fondos en proceso de retiro

  @Column({ type: 'text', nullable: true })
  private_key_encrypted: string;

  //@Column({ type: 'numeric', default: 0 })
  //on_chain_balance: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  @OneToOne(() => BankAccount, (account) => account.wallet)
  @JoinColumn({name:'bank_account_id'})
  bank_account: BankAccount;
  @Column('uuid', {nullable:true})
  bank_account_id: string;
} 
