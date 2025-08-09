import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletsRepository } from './wallets.repository';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { HttpModule } from '@nestjs/axios';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, TransactionType, TransactionState]), HttpModule],
  controllers: [WalletsController],
  providers: [WalletsService, WalletsRepository],
})
export class WalletsModule {}
