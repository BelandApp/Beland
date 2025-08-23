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
// import { OrderItem } from '../../order-items/entities/order-item.entity'; // No utilizada actualmente
import { Payment } from '../../payments/entities/payment.entity';
import { Action } from '../../actions/entities/action.entity';
import { RecycledItem } from '../../recycled-items/entities/recycled-item.entity';
import { PrizeRedemption } from '../../prize-redemptions/entities/prize-redemption.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { Role } from '../../roles/entities/role.entity';
import { Admin } from '../../admins/entities/admin.entity';
import { Exclude } from 'class-transformer';
import { BankAccount } from 'src/bank-account/entities/bank-account.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { UserAddress } from 'src/user-address/entities/user-address.entity';
import { UserCard } from 'src/user-cards/entities/user-card.entity';
import { GroupInvitation } from 'src/group-invitations/entities/group-invitation.entity';
import { WithdrawAccount } from 'src/withdraw-account/entities/withdraw-account.entity';

// Definición de tipo para todos los roles válidos (importante para consistencia)
export type ValidRoleNames =
  | 'USER'
  | 'LEADER'
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'COMMERCE'
  | 'FUNDATION';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Clave primaria UUID

  @Column({ type: 'text', nullable: true })
  auth0_id: string | null; // ID de Auth0 (se mantiene para usuarios OAuth)

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

  @Column({ type: 'numeric', nullable: true, default: 0 })
  current_balance: number | null;

  @Column({ type: 'text', default: 'USER' })
  role_name: ValidRoleNames; // Nombre del rol (ej. 'USER', 'ADMIN')

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'numeric', nullable: true })
  phone: number | null;

  @Column({ type: 'text', nullable: true })
  country: string | null;

  @Column({ type: 'text', nullable: true })
  city: string | null;

  // CORREGIDO: Mapeo explícito a 'isblocked' en la base de datos
  @Column({ type: 'boolean', default: false, name: 'isblocked' })
  isBlocked: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Exclude() // Excluir la contraseña de las respuestas JSON
  @Column({ type: 'text', nullable: true })
  password: string | null;

  // Relación ManyToOne con la entidad Role
  @ManyToOne(() => Role, (role) => role.users, {
    eager: true,
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'role_id' })
  role: Role ;
  @Column({ type: 'uuid'})
  role_id: string; // ID del rol (FK)

  // ¡NUEVA RELACIÓN OneToOne con Admin!
  @OneToOne(() => Admin, (admin) => admin.user)
  admin: Admin;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  // Relaciones existentes (asegúrate de que las entidades referenciadas existan)
  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @OneToMany(() => Group, (group) => group.leader)
  led_groups: Group[];

  @OneToMany(() => GroupMember, (member) => member.user)
  group_memberships: GroupMember[];

  // NEW: Invitations sent by this user
  @OneToMany(() => GroupInvitation, (invitation) => invitation.sender)
  sent_invitations: GroupInvitation[];

  // NEW: Invitations received by this user
  @OneToMany(() => GroupInvitation, (invitation) => invitation.invited_user)
  received_invitations: GroupInvitation[];

  @OneToMany(() => Order, (order) => order.leader)
  orders: Order[];

  // @OneToMany(() => OrderItem, (item) => item.consumed_by_user)
  // consumed_items: OrderItem[]; // Comentada si no está en uso

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

  @OneToOne(() => Organization, (org) => org.user)
  organization: Organization;

  @OneToMany(() => UserAddress, (address) => address.user, { cascade: true })
  addresses: UserAddress[];

  @OneToMany(() => UserCard, (card) => card.user, { cascade: true })
  cards: UserCard[];

    // 🔹 Un usuario puede tener varias cuentas de retiro
  @OneToMany(() => WithdrawAccount, (withdrawAccount) => withdrawAccount.user)
  withdraw_accounts: WithdrawAccount[];
}
