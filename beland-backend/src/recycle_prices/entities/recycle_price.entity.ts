import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recycle_prices')
export class RecyclePrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Tipo de material: botella, lata, etc. */
  @Column({ type: 'varchar', length: 50 })
  material_type: string;

  /** Valor en Becoin que otorga este material */
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  becoin_value: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
