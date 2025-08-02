import { User } from "src/users/entities/users.entity";
import { Wallet } from "src/wallets/entities/wallet.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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

  @Column({ type: 'text' })
  brand: string;                      // Visa, Mastercard…

  @Column({ type: 'text' })
  last4: string;                      // últimos 4 dígitos

  @Column({ type: 'timestamptz' })
  added_at: Date;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;
}