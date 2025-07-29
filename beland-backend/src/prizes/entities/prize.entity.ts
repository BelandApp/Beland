// prize.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PrizeRedemption } from 'src/prize-redemptions/entities/prize-redemption.entity';

@Entity('prizes')
export class Prize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric' })
  cost: number;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => PrizeRedemption, (redemption) => redemption.prize)
  redemptions: PrizeRedemption[];
}
