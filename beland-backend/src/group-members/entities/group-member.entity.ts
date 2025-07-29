// group-member.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/users.entity';

@Entity('group_members')
@Unique(['group', 'user'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', default: 'MEMBER' })
  role: 'LEADER' | 'MEMBER';

  @CreateDateColumn({ type: 'timestamptz' })
  joined_at: Date;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  group: Group;

  @ManyToOne(() => User, (user) => user.group_memberships, {
    onDelete: 'CASCADE',
  })
  user: User;
}
