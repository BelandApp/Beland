import { Module } from '@nestjs/common';
import { TransactionTypeService } from './transaction-type.service';
import { TransactionTypeController } from './transaction-type.controller';

@Module({
  controllers: [TransactionTypeController],
  providers: [TransactionTypeService],
})
export class TransactionTypeModule {}
