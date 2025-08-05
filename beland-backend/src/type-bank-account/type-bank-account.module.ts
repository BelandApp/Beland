import { Module } from '@nestjs/common';
import { TypeBankAccountsService } from './type-bank-account.service';
import { TypeBankAccountsController } from './type-bank-account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeBankAccount } from './entities/type-bank-account.entity';
import { TypeBankAccountsRepository } from './type-bank-account.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TypeBankAccount])],
  controllers: [TypeBankAccountsController],
  providers: [TypeBankAccountsService, TypeBankAccountsRepository],
})
export class TypeBankAccountModule {}
