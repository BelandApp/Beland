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
import typeormConfig from './config/typeorm';
import { RequestLoggerMiddleware } from './middlleware/request-logger.middleware';
import { DatabaseInitModule } from './database/init/database-init.module';

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
