import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity'; 
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { BankAccountType } from 'src/bank-account-type/entities/bank-account-type.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  owner_name: string;

  @Column({ type: 'varchar', length: 3 })
  bank_code: string;

  // hacer la relacion con la table todavia no creadad+ de typo de ciuenta
  @ManyToOne(() => BankAccountType)
  @JoinColumn({ name: 'account_type_id' })
  account_type: BankAccountType
  @Column({ type: 'varchar' })
  account_type_id: string;

  @Column({ type: 'varchar' })
  cbu: string;

  @Column({ type: 'text', nullable: true })
  alias?: string;

  @ManyToOne(() => User, (user) => user.bank_accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  @OneToOne(() => Wallet, (wallet) => wallet.bank_account, { onDelete: 'CASCADE' })
  wallet: Wallet;


  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}