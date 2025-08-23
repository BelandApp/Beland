// wallet.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { WithdrawAccount } from 'src/withdraw-account/entities/withdraw-account.entity';

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

  // 🔹 Relación con cuenta de retiro
  @OneToOne(() => WithdrawAccount, (withdrawAccount) => withdrawAccount.wallet, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'withdraw_account_id' })
  withdraw_account: WithdrawAccount;
  @Column('uuid', {nullable:true})
  withdraw_account_id:string

} 
