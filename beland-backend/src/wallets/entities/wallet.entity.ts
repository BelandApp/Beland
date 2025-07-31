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

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  private_key_encrypted: string;

  @Column({ type: 'numeric', default: 0 })
  on_chain_balance: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;
}
