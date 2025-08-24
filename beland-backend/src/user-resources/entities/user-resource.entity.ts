import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Resource } from '../../resources/entities/resource.entity';

@Entity('user_resources')
export class UserResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @ManyToOne(() => Resource )
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
  @Column({ type: 'uuid' })
  @Index()
  resource_id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  quantity_redeemed: number;

  @Column({ type: 'text', unique: true })
  hash_id: string; // identificador único del recurso comprado

  @Column({ type: 'text', nullable: true })
  qr_code: string; // string base64 o URL al QR generado

  @Column({ type: 'boolean', default: false })
  is_redeemed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  redeemed_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date; // fecha de expiración del recurso

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

