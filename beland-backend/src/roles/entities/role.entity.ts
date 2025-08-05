import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/users.entity'; // Importar la entidad User

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  role_id: string;

  @Column({ type: 'text', unique: true })
  // ¡ACTUALIZADO para incluir 'EMPRESA' en la entidad!
  name: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'EMPRESA';

  @Column({ type: 'text', nullable: true })
  description: string | null; // Cambiado a string | null para coincidir con nullable: true

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relación OneToMany con la entidad User
  @OneToMany(() => User, (user) => user.role_relation)
  users: User[];
}
