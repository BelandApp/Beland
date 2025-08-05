import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Group } from '../../groups/entities/group.entity';
import { GroupMember } from '../../group-members/entities/group-member.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Action } from '../../actions/entities/action.entity';
import { RecycledItem } from '../../recycled-items/entities/recycled-item.entity';
import { PrizeRedemption } from '../../prize-redemptions/entities/prize-redemption.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { Role } from '../../roles/entities/role.entity';
import { Exclude } from 'class-transformer';
import { BankAccount } from 'src/bank-account/entities/bank-account.entity';
import { Merchant } from 'src/merchants/entities/merchant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Clave primaria UUID

  @Column({ type: 'text', nullable: true })
  oauth_provider: string | null;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  username: string | null;

  @Column({ type: 'text', nullable: true })
  full_name: string | null;

  @Column({ type: 'text', nullable: true })
  profile_picture_url: string | null;

  @Column({ type: 'numeric', default: 0 })
  current_balance: number;

  @Column({ type: 'text', default: 'USER', name: 'role_name' })
  // ¡ACTUALIZADO para incluir 'EMPRESA'!
  role_name: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'EMPRESA'; // Columna para el nombre del rol

  @Column({ type: 'uuid', nullable: true, name: 'role_id' })
  role_id: string | null; // Clave foránea al ID del rol

  @Column({ type: 'text', nullable: true })
  auth0_id: string | null; // ID de Auth0, se mantiene como columna secundaria

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'numeric', nullable: true })
  phone: number | null;

  @Column({ type: 'text', nullable: true })
  country: string | null;

  @Column({ type: 'text', nullable: true })
  city: string | null;

  @Column({ type: 'boolean', default: false, name: 'isblocked' })
  isBlocked: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'text', nullable: true })
  @Exclude({ toPlainOnly: true }) // Excluir la contraseña del DTO por seguridad
  password?: string | null; // Campo de contraseña

  // Relación ManyToOne con la entidad Role
  @ManyToOne(() => Role, (role) => role.users, {
    eager: false, // No cargar automáticamente para evitar ciclos y mejorar rendimiento
    onDelete: 'SET NULL', // Si el rol es eliminado, se establece a NULL
    nullable: true, // Un usuario puede no tener un rol asignado (aunque en la lógica se asigna por defecto)
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'role_id' }) // Unir por role_id
  role_relation: Role | null; // La propiedad que representa la relación con Role

  // Relaciones existentes (asegúrate de que las entidades referenciadas existan)
  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @OneToMany(() => Group, (group) => group.leader)
  led_groups: Group[];

  @OneToMany(() => GroupMember, (member) => member.user)
  group_memberships: GroupMember[];

  @OneToMany(() => Order, (order) => order.leader)
  orders: Order[];

  @OneToMany(() => OrderItem, (item) => item.consumed_by_user)
  consumed_items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Action, (action) => action.user)
  actions: Action[];

  @OneToMany(() => RecycledItem, (item) => item.scanned_by_user)
  scanned_items: RecycledItem[];

  @OneToMany(() => PrizeRedemption, (redemption) => redemption.user)
  prize_redemptions: PrizeRedemption[];

  @OneToMany(() => Coupon, (coupon) => coupon.redeemed_by_user)
  redeemed_coupons: Coupon[];

  @OneToMany(() => BankAccount, (account) => account.user)
  bank_accounts: BankAccount[];

  @OneToOne(() => Merchant, (merchant) => merchant.user)
  merchant: Merchant;
}
