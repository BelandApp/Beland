import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletsRepository } from './wallets.repository';
import { PayphoneService } from 'src/payphone/payphone.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { PaymentMethod } from 'src/payment_methods/entities/payment_method.entity';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, PaymentMethod, TransactionType]), HttpModule],
  controllers: [WalletsController],
  providers: [WalletsService, WalletsRepository, PayphoneService],
})
export class WalletsModule {}
