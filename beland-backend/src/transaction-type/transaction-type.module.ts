import { Module } from '@nestjs/common';
import { TransactionTypesService } from './transaction-type.service';
import { TransactionTypesController } from './transaction-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionType } from './entities/transaction-type.entity';
import { TransactionTypesRepository } from './transaction-type.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionType])],
  controllers: [TransactionTypesController],
  providers: [TransactionTypesService, TransactionTypesRepository],
})
export class TransactionTypeModule {}
