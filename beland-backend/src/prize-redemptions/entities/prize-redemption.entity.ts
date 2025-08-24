// prize-redemption.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Prize } from '../../prizes/entities/prize.entity';

@Entity('prize_redemptions')
export class PrizeRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  status: 'PENDING' | 'DELIVERED';

  @CreateDateColumn({ type: 'timestamptz' })
  redemption_date: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.prize_redemptions)
  user: User;

  @ManyToOne(() => Prize, (prize) => prize.redemptions)
  prize: Prize;
}
