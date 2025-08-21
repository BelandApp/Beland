import { Module } from '@nestjs/common';
import { WithdrawAccountTypesService } from './withdraw-account-type.service';
import { WithdrawAccountTypesController } from './withdraw-account-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawAccountType } from './entities/withdraw-account-type.entity';
import { WithdrawAccountTypesRepository } from './withdraw-account-type.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawAccountType])],
  controllers: [WithdrawAccountTypesController],
  providers: [WithdrawAccountTypesService, WithdrawAccountTypesRepository],
})
export class WithdrawAccountTypeModule {}
