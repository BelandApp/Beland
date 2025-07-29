// group.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { GroupMember } from 'src/group-members/entities/group-member.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/users.entity';

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

  @ManyToOne(() => User, (user) => user.led_groups, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  leader: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => Order, (order) => order.group)
  orders: Order[];
}
