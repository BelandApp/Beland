import { Module } from '@nestjs/common';
import { TransactionStateService } from './transaction-state.service';
import { TransactionStateController } from './transaction-state.controller';

@Module({
  controllers: [TransactionStateController],
  providers: [TransactionStateService],
})
export class TransactionStateModule {}
