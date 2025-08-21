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
import { WithdrawAccountType } from 'src/withdraw-account-type/entities/withdraw-account-type.entity';

@Entity('withdraw_accounts')
export class WithdrawAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  owner_name: string;

  // 🔹 Relación con tipos de cuenta (BANK / WALLET)
  @ManyToOne(() => WithdrawAccountType, (type) => type.withdraw_accounts, { eager: true })
  @JoinColumn({ name: 'type_id' })
  type: WithdrawAccountType;
  @Column('uuid')
  type_id: string;

  // 🔹 Solo si es cuenta bancaria
  @Column({ type: 'varchar', nullable: true })
  cbu?: string;

  @Column({ type: 'varchar', nullable: true })
  alias?: string;

  // 🔹 Solo si es billetera virtual
  @Column({ type: 'varchar', nullable: true })
  provider?: string; // Ej: 'MercadoPago', 'Payphone'

  @Column({ type: 'varchar', nullable: true })
  phone?: string; // Número de teléfono de la billetera virtual

  @ManyToOne(() => User, (user) => user.withdraw_accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  @OneToOne(() => Wallet, (wallet) => wallet.withdraw_account, { onDelete: 'CASCADE' })
  wallet: Wallet;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
