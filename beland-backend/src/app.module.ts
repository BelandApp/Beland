import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ThrottlerModule,
  ThrottlerModuleOptions,
  ThrottlerGuard,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CouponsModule } from './coupons/coupons.module';
import { PrizeRedemptionsModule } from './prize-redemptions/prize-redemptions.module';
import { PrizesModule } from './prizes/prizes.module';
import { RecycledItemsModule } from './recycled-items/recycled-items.module';
import { ActionsModule } from './actions/actions.module';
import { PaymentsModule } from './payments/payments.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { ProductsModule } from './products/products.module';
import { GroupMembersModule } from './group-members/group-members.module';
import { GroupsModule } from './groups/groups.module';
import { WalletsModule } from './wallets/wallets.module';
import { DatabaseModule } from './database/database.module';
import { DataSourceOptions } from 'typeorm';
import typeormConfig from './config/typeorm'; // Asegúrate de que este archivo exista y exporte la configuración
import { RequestLoggerMiddleware } from './middlleware/request-logger.middleware'; // Asegúrate de que este archivo exista
import { TransactionsModule } from './transactions/transactions.module';
import { RecyclePricesModule } from './recycle_prices/recycle_prices.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { MerchantsModule } from './merchants/merchants.module';
import { TransactionTypeModule } from './transaction-type/transaction-type.module';
import { TransactionStateModule } from './transaction-state/transaction-state.module';
import { CharityModule } from './charity/charity.module';
import { BankAccountTypeModule } from './bank-account-type/bank-account-type.module';
import { DatabaseInitModule } from './database/init/database-init.module';
import { JwtModule } from '@nestjs/jwt';
import { AdminsModule } from './admins/admins.module';
import { CartModule } from './cart/cart.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { UserCardsModule } from './user-cards/user-cards.module';
import { UserAddressModule } from './user-address/user-address.module';
import { PaymentTypesModule } from './payment-types/payment-types.module';
import { GroupInvitationsModule } from './group-invitations/group-invitations.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
    }),
    // modulo para generar los token
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        return {
          secret,
          signOptions: { expiresIn: '12h' },
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60),
            limit: config.get<number>('THROTTLE_LIMIT', 10),
          },
        ],
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        const dbConfig = configService.get<DataSourceOptions>('typeorm');
        return {
          ...dbConfig,
          entities: [__dirname + '/**/*.entity{.ts,.js}'], // Asegúrate de que esto apunte a tus entidades
        };
      },
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    DatabaseModule,
    DatabaseInitModule,
    UsersModule,
    RolesModule,
    WalletsModule,
    GroupsModule,
    GroupMembersModule,
    ProductsModule,
    InventoryItemsModule,
    OrdersModule,
    OrderItemsModule,
    PaymentsModule,
    ActionsModule,
    RecycledItemsModule,
    PrizesModule,
    PrizeRedemptionsModule,
    CouponsModule,
    AuthModule,
    CommonModule,
    TransactionsModule,
    RecyclePricesModule,
    BankAccountModule,
    MerchantsModule,
    TransactionTypeModule,
    TransactionStateModule,
    CharityModule,
    BankAccountTypeModule,
    AdminsModule,
    CartModule,
    CartItemsModule,
    UserCardsModule,
    UserAddressModule,
    PaymentTypesModule,
    GroupInvitationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
