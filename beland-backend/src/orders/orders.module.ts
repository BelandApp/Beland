import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './orders.repository';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartsRepository } from 'src/cart/cart.repository';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { OrderItemsRepository } from 'src/order-items/order-items.repository';
import { PaymentType } from 'src/payment-types/entities/payment-type.entity';
import { PaymentTypesRepository } from 'src/payment-types/payment-types.repository';
import { WalletsService } from 'src/wallets/wallets.service';
import { Payment } from 'src/payments/entities/payment.entity';
import { PaymentsRepository } from 'src/payments/payments.repository';
import { WalletsRepository } from 'src/wallets/wallets.repository';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { NotificationsSocketModule } from 'src/notification-socket/notification-socket.module';

@Module({
  imports: [NotificationsSocketModule, TypeOrmModule.forFeature([Order, Wallet, Cart, OrderItem, PaymentType, Payment, 
    TransactionType, TransactionState, Transaction
  ])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, WalletsService, CartsRepository, OrderItemsRepository,
    PaymentTypesRepository, PaymentsRepository, WalletsRepository
  ],
})
export class OrdersModule {}
