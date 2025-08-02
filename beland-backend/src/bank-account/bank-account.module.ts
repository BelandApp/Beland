import { Module } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountService],
})
export class BankAccountModule {}
