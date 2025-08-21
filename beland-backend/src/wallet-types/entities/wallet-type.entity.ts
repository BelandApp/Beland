import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany 
} from 'typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';

@Entity('wallet_types')
export class WalletType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Código único del tipo: USER, ADMIN, COMMERCE, NGO, etc. */
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  /** Nombre legible: Usuario, Superadmin, Comercio, Organización, etc. */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Descripción opcional para la UI */
  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  /** Relación inversa con Wallet */
  @OneToMany(() => Wallet, (wallet) => wallet.type)
  wallets: Wallet[];
}
