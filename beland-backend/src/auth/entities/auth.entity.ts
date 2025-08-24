// src/auth/entities/auth.entity.ts
import { Role } from '../../roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'auth_verifications' }) // Nombre de tabla en plural
export class AuthVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 6 })
  code: string; // Código de verificación de 6 dígitos

  @Column({ unique: true })
  email: string;

  @Column('varchar', { nullable: true }) // <--- ¡CAMBIO AQUÍ: username ahora es nullable!
  username?: string; // Ahora es opcional

  @Column('varchar', { nullable: true })
  full_name?: string;

  @Column('varchar', { nullable: true })
  profile_picture_url?: string;

  // Propiedades de rol, ahora son opcionales para coincidir con NULLABLE en la DB
  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @Column('uuid', { nullable: true })
  role_id?: string;

  @Column('varchar', { nullable: true })
  role_name?: string;

  @Column({ name: 'password_hashed' }) // Coincide con el nombre de columna en la DB
  passwordHashed: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'integer', nullable: true }) // Coincide con el tipo 'integer' en la DB
  phone?: number;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  city?: string;

  // Nuevas propiedades para la verificación
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true }) // Coincide con NULLABLE en la DB
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
