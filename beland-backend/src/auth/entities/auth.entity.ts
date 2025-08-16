import { Role } from "src/roles/entities/role.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "auth_verification" })
export class AuthVerification {
  
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 6 })
  code: string; // código de verificación de 6 dígitos

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @ManyToOne(() => Role)
  @JoinColumn({name: 'role_id'})
  role: Role;
  @Column('uuid')
  role_id:string;

  @Column({ name: "password_hashed" })
  passwordHashed: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: number;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  city?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

}
