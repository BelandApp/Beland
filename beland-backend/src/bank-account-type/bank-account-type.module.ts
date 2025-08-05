import { Module } from '@nestjs/common';
import { BankAccountTypeService } from './bank-account-type.service';
import { BankAccountTypeController } from './bank-account-type.controller';

@Module({
  controllers: [BankAccountTypeController],
  providers: [BankAccountTypeService],
})
export class BankAccountTypeModule {}
