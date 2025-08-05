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
import { InitModule } from './init/init.module';
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
import { TypeTransactionsModule } from './type-transactions/type-transactions.module';
import { PaymentMethodsModule } from './payment_methods/payment_methods.module';
import { RecyclePricesModule } from './recycle_prices/recycle_prices.module';
import { PayphoneModule } from './payphone/payphone.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { MerchantsModule } from './merchants/merchants.module';
import { TypeBankAccountModule } from './type-bank-account/type-bank-account.module';
import { TransactionTypeModule } from './transaction-type/transaction-type.module';
import { TransactionStateModule } from './transaction-state/transaction-state.module';
import { CharityModule } from './charity/charity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
      envFilePath: '.env',
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
    DatabaseModule,
    UsersModule,
    RolesModule,
    InitModule,
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
    TypeTransactionsModule,
    PaymentMethodsModule,
    RecyclePricesModule,
    PayphoneModule,
    BankAccountModule,
    MerchantsModule,
    TypeBankAccountModule,
    TransactionTypeModule,
    TransactionStateModule,
    CharityModule,
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
