// src/group-invitations/entities/group-invitation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Group } from 'src/groups/entities/group.entity';

@Entity('group_invitations')
@Unique(['group', 'invited_user']) // Ensures a user can only have one pending invitation per group
export class GroupInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, (group) => group.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
  group: Group;
  @Column('uuid')
  group_id: string; // Columna para la FK explícita

  @ManyToOne(() => User, (user) => user.sent_invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  sender: User;
  @Column('uuid')
  sender_id: string; // Columna para la FK explícita del remitente

  @ManyToOne(() => User, (user) => user.received_invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invited_user_id', referencedColumnName: 'id' })
  invited_user: User;
  @Column('uuid')
  invited_user_id: string; // Columna para la FK explícita del usuario invitado

  @Column({
    type: 'text',
    default: 'PENDING',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED', 'EXPIRED'],
  })
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED' | 'EXPIRED';

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date | null; // Optional: for invitations with an expiration time

  @Column({ type: 'timestamptz', nullable: true }) // <-- NUEVA COLUMNA PARA SOFT DELETE
  deleted_at: Date | null;
}
