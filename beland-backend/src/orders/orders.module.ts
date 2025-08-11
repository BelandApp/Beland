import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './orders.repository';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { WalletsRepository } from 'src/wallets/wallets.repository';
import { CartsRepository } from 'src/cart/cart.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Wallet, Cart])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, WalletsRepository, CartsRepository],
})
export class OrdersModule {}
