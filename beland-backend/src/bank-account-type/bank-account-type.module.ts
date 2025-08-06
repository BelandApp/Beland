import { Module } from '@nestjs/common';
import { BankAccountTypesService } from './bank-account-type.service';
import { BankAccountTypesController } from './bank-account-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountType } from './entities/bank-account-type.entity';
import { BankAccountTypesRepository } from './bank-account-type.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccountType])],
  controllers: [BankAccountTypesController],
  providers: [BankAccountTypesService, BankAccountTypesRepository],
})
export class BankAccountTypeModule {}
