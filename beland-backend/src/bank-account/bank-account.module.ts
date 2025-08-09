import { Module } from '@nestjs/common';
import { BankAccountsService } from './bank-account.service';
import { BankAccountsController } from './bank-account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { BankAccountsRepository } from './bank-account.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount])],
  controllers: [BankAccountsController],
  providers: [BankAccountsService, BankAccountsRepository],
})
export class BankAccountModule {}
