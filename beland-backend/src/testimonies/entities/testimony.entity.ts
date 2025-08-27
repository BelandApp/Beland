// src/testimonies/entities/testimony.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity'; // Importa la entidad User

@Entity('testimonies') // Nombre de la tabla en la base de datos
export class Testimony {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  content: string; // El contenido del testimonio

  @Column({ type: 'int', nullable: true })
  rating?: number; // Calificación opcional (ej. 1-5 estrellas)

  @Column({ type: 'boolean', default: false })
  is_approved: boolean; // Indica si el testimonio ha sido aprobado por un administrador

  @Column({ type: 'uuid', nullable: false })
  user_id: string; // ID del usuario que escribió el testimonio

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date; // Para soft-delete

  // Relación ManyToOne con User (un usuario puede tener muchos testimonios)
  @ManyToOne(() => User, (user) => user.testimonies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // Objeto del usuario relacionado
}
