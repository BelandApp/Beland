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

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  becoin_balance: number;             // saldo disponible en Becoin

  @Column({ type: 'numeric', default: 0 })
  locked_balance: number;             // opcional: fondos en proceso de retiro

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;
} 
