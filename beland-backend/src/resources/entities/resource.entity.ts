import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ResourcesType } from '../../resources-types/entities/resources-type.entity';
import { User } from '../../users/entities/users.entity';

@Entity('resources')
export class Resource {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  code: string;

  @Column({ type: 'text'})
  name: string;

  @Column({ type: 'text'})
  description: string;

  @Column({ type: 'text', nullable:true})
  url_image: string;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  becoin_value: number;   

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'boolean', default: false })
  is_expired: boolean;

  @Column('int', { default: 1 })
  limit_user: number;

  @Column('int', { default: 0 })
  limit_app: number;

  @Column('int', { default: 0 })
  used_acount: number;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => ResourcesType)
  @JoinColumn({name:'resource_type_id'})
  resource_type: ResourcesType
  @Column({ type: 'uuid' })
  resource_type_id: string;

  @ManyToOne(() => User)
  @JoinColumn({name:'user_commerce_id'})
  user_commerce: User
  @Column({ type: 'uuid' })
  user_commerce_id: string;
}
