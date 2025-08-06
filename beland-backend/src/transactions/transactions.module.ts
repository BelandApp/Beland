import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsRepository } from './transactions.repository';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionState])],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
