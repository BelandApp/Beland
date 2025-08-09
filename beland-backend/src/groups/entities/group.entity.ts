// src/groups/entities/group.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn, // <-- ¡IMPORTADO!
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

  // Relación ManyToOne con la entidad User (el líder del grupo)
  @ManyToOne(() => User, (user) => user.led_groups, {
    nullable: true, // Un grupo podría no tener un líder asignado inicialmente (aunque la lógica lo asigna)
    onDelete: 'SET NULL', // Si el usuario líder es eliminado, su referencia en el grupo se establece a NULL
  })
  @JoinColumn({ name: 'leader_id', referencedColumnName: 'id' }) // <-- ¡AÑADIDO ESTO! Define la columna FK explícitamente
  leader: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => Order, (order) => order.group)
  orders: Order[];
}
