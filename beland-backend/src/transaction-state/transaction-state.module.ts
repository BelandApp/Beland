import { Module } from '@nestjs/common';
import { TransactionStatesService } from './transaction-state.service';
import { TransactionStatesController } from './transaction-state.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionState } from './entities/transaction-state.entity';
import { TransactionStatesRepository } from './transaction-state.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionState])],
  controllers: [TransactionStatesController],
  providers: [TransactionStatesService, TransactionStatesRepository],
})
export class TransactionStateModule {}
