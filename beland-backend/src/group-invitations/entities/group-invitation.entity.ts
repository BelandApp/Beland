// src/group-invitations/entities/group-invitation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/users.entity';

// Definición de la enumeración para el estado de la invitación
export enum GroupInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

@Entity('group_invitations')
export class GroupInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  group_id: string;

  @Column({ type: 'uuid' })
  sender_id: string; // El usuario que envía la invitación

  @Column({ type: 'uuid', nullable: true })
  invited_user_id: string; // El usuario invitado (si ya existe en la BD)

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string; // Email del invitado (puede ser para usuarios no registrados aún)

  @Column({ type: 'varchar', length: 255, nullable: true })
  username: string; // Nombre de usuario del invitado (si se conoce o se usa para identificar)

  @Column({ type: 'varchar', length: 20, nullable: true }) // Cambiado a varchar para números de teléfono
  phone: string; // Número de teléfono del invitado

  @Column({
    type: 'enum',
    enum: ['LEADER', 'MEMBER'], // Rol que tendrá el usuario en el grupo si acepta
    default: 'MEMBER',
  })
  role: 'LEADER' | 'MEMBER';

  @Column({
    type: 'enum',
    enum: GroupInvitationStatus, // Usamos la enumeración definida
    default: GroupInvitationStatus.PENDING,
  })
  status: GroupInvitationStatus;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date; // Fecha y hora de expiración de la invitación (como Date en la entidad)

  @Column({ type: 'timestamp', nullable: true })
  reminder_sent_at: Date; // Fecha y hora del último recordatorio enviado

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date; // Para soft-delete

  // Relaciones
  @ManyToOne(() => Group, (group) => group.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User, (user) => user.sent_invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.received_invitations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'invited_user_id' })
  invited_user: User;
}
