import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './users.entity';

@Entity('users-event-beland')
export class UserEventBeland {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Clave primaria UUID

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_payment_id'})
  user_payment: User;
  @Column({ type: 'uuid'})
  user_payment_id: string

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_sale_id'})
  user_sale: User;
  @Column({ type: 'uuid'})
  user_sale_id: string

  @Column('boolean')
  isRecycled: boolean;

  @Column({type:'numeric', precision:14, scale: 2, default: 0})
  amount: number;

  @CreateDateColumn()
  created_at: Date;

}
