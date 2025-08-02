import { Module } from '@nestjs/common';
import { TypeTransactionsService } from './type-transactions.service';
import { TypeTransactionsController } from './type-transactions.controller';

@Module({
  controllers: [TypeTransactionsController],
  providers: [TypeTransactionsService],
})
export class TypeTransactionsModule {}
