import { User } from 'src/users/entities/users.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('charities')
export class Charity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nombre legal de la fundación */
  @Column({ type: 'varchar', length: 150 })
  name: string;

  /** Nombre comercial o abreviado (opcional) */
  @Column({ type: 'varchar', length: 100, nullable: true })
  display_name?: string;

  /** Número de registro legal / RUC / Tax ID */
  @Column({ type: 'varchar', length: 50, unique: true })
  registration_number: string;

  /** Descripción corta de la fundación */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /** Página web oficial */
  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  /** Email de contacto principal */
  @Column({ type: 'varchar', length: 100 })
  email: string;

  /** Teléfono de contacto */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  /** Dirección física */
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  /** Logo o imagen representativa */
  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_url?: string;

  /** Cuenta bancaria o wallet interna para recibir donaciones */
  @OneToOne( () => Wallet)
  @JoinColumn({name:'wallet_id'})
  wallet: Wallet;
  @Column({ type: 'uuid', nullable: true })
  wallet_id?: string;

  /** Cuenta bancaria o wallet interna para recibir donaciones */
  @OneToOne( () => User, {onDelete: 'CASCADE'})
  @JoinColumn({name:'user_id'})
  user: User;
  @Column({ type: 'uuid'})
  user_id: string;

  /** Estado: activa o deshabilitada */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
