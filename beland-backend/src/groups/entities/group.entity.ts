// src/groups/entities/group.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn, // <-- Correctly imported
} from 'typeorm';
import { GroupMember } from 'src/group-members/entities/group-member.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/users.entity';
import { GroupInvitation } from 'src/group-invitations/entities/group-invitation.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  location_url: string;

  @Column({ type: 'timestamptz', nullable: true })
  date_time: Date;

  @Column({ type: 'text', default: 'ACTIVE' })
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE';

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' }) // <-- New column for last update date
  updated_at: Date;

  @Column({ type: 'timestamptz', nullable: true }) // <-- New column for soft delete
  deleted_at: Date | null;

  // ManyToOne relationship with User entity (the group leader)
  @ManyToOne(() => User, (user) => user.led_groups, {
    nullable: true, // A group might not have a leader assigned initially (though logic assigns one)
    onDelete: 'SET NULL', // If the leader user is deleted, their reference in the group is set to NULL
  })
  @JoinColumn({ name: 'leader_id', referencedColumnName: 'id' }) // <-- Explicitly define FK column
  leader: User;
  @Column('uuid') // This column stores the actual UUID of the leader
  leader_id: string;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => Order, (order) => order.group)
  orders: Order[];

  // NEW: Invitations associated with this group
  @OneToMany(() => GroupInvitation, (invitation) => invitation.group)
  invitations: GroupInvitation[];
}
