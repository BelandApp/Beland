import { User } from '../../users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('preset_amounts')
export class PresetAmount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: { 
      to: (value: number) => value?.toString(),
      from: (value: string) => parseFloat(value),
    } 
  })
  amount: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relación con User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_commerce_id' })
  user_commerce: User;

  @Column({ type: 'uuid' })
  user_commerce_id: string;
}
