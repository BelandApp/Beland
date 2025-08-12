import { Module } from '@nestjs/common';
import { PreloadService } from './preload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    TransactionState, TransactionType
  ])],
  controllers: [],
  providers: [PreloadService],
})
export class PreloadModule {}
