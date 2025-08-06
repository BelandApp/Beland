// src/admins/entities/admin.entity.ts
import { User } from '../../users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  admin_id: string;

  // Cambiado para referenciar el 'id' (PK) de la tabla User
  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  user_id: string; // Este es ahora el 'id' (UUID) del User

  @OneToOne(() => User, (user) => user.admin, { onDelete: 'CASCADE' })
  // La columna referenciada ahora es 'id' de la tabla User
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({
    type: 'timestamptz',
    name: 'assigned_at',
    nullable: true,
    default: () => 'NOW()',
  })
  assigned_at: Date;

  @Column({ type: 'boolean', default: true, name: 'content_permission' })
  content_permission: boolean;

  @Column({ type: 'boolean', default: true, name: 'user_permission' })
  user_permission: boolean;

  @Column({ type: 'boolean', default: true, name: 'moderation_permission' })
  moderation_permission: boolean;

  @Column({ type: 'boolean', default: true, name: 'finance_permission' })
  finance_permission: boolean;

  @Column({ type: 'boolean', default: true, name: 'analytics_permission' })
  analytics_permission: boolean;

  @Column({ type: 'boolean', default: true, name: 'settings_permission' })
  settings_permission: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'leader_management_permission',
  })
  leader_management_permission: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'company_management_permission',
  })
  company_management_permission: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}
