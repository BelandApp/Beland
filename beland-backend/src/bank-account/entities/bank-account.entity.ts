import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity'; 
import { TypeBankAccount } from 'src/type-bank-account/entities/type-bank-account.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  owner_name: string;

  @Column({ type: 'varchar', length: 3 })
  bank_code: string;

  // hacer la relacion con la table todavia no creadad+ de typo de ciuenta
  @ManyToOne(() => TypeBankAccount)
  @JoinColumn({ name: 'account_type_id' })
  account_type: TypeBankAccount
  @Column({ type: 'varchar' })
  account_type_id: string;

  @Column({ type: 'varchar' })
  cbu: string;

  @Column({ type: 'text', nullable: true })
  alias?: string;

  @ManyToOne(() => User, (user) => user.bank_accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column('uuid')
  user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}