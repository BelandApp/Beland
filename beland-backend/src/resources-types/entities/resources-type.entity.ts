import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum ResourceTypeCode {
  DISCOUNT = 'DISCOUNT',
  BONUS_COINS = 'BONUS_COINS',
  EVENT_PASS = 'EVENT_PASS',
}

@Entity('resource_types')
export class ResourcesType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ResourceTypeCode, unique: true })
  code: ResourceTypeCode;

  @Column({ type: 'varchar', length: 150 })
  description: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;
}
