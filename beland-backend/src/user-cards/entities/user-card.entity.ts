import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';

@Entity('user_cards')
export class UserCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User,/* user => user.cards,*/ { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  @Column({ length: 150 })
  email: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ length: 50 })
  documentId: string;

  @Column({ length: 50 })
  cardBrand: string;

  @Column({ length: 100 })
  cardHolder:string

  @Column({ length: 20 })
  cardType: 'Credit' | 'Debit';

  @Column({ type: 'int' })
  lastDigits: number;

  @Column({ length: 255 })
  cardToken: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
