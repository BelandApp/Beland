import { Module } from '@nestjs/common';
import { WithdrawAccountsService } from './withdraw-account.service';
import { WithdrawAccountsController } from './withdraw-account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawAccount } from './entities/withdraw-account.entity';
import { WithdrawAccountsRepository } from './withdraw-account.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawAccount])],
  controllers: [WithdrawAccountsController],
  providers: [WithdrawAccountsService, WithdrawAccountsRepository],
})
export class WithdrawAccountModule {}
