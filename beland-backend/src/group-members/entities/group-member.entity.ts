// src/group-members/entities/group-member.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../users/entities/users.entity';

@Entity('group_members')
@Unique(['group', 'user']) // Ensures a user can only be a member of a group once
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // This 'role' column defines the user's role *within this specific group*
  // It can be 'LEADER' (if they are the group's designated leader) or 'MEMBER'.
  // This is distinct from the global 'role_name' in the User entity.
  @Column({ type: 'text', default: 'MEMBER' })
  role: 'LEADER' | 'MEMBER';

  @CreateDateColumn({ type: 'timestamptz' })
  joined_at: Date;

  // ManyToOne relationship with Group
  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
  group: Group;

  // ManyToOne relationship with User
  @ManyToOne(() => User, (user) => user.group_memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
