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

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  owner_name: string;

  @Column({ type: 'varchar' })
  cbu: string;

  @Column({ type: 'varchar', nullable: true })
  alias?: string;

  @ManyToOne(() => User, (user) => user.bank_accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}