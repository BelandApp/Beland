import { User } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  @Column({ type: 'text' })
  token: string;                      // token devuelto por PayPhone

  @Column({ type: 'text', nullable: true })
  description: string; 

  @Column({ type: 'text' })
  brand: string;                      // Visa, Mastercard…

  @Column({ type: 'text' })
  last4: string;                      // últimos 4 dígitos

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}