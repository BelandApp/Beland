import { Module } from '@nestjs/common';
import { UserWithdrawsService } from './user-withdraw.service';
import { UserWithdrawsController } from './user-withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWithdraw } from './entities/user-withdraw.entity';
import { UserWithdrawsRepository } from './user-withdraw.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserWithdraw])],
  controllers: [UserWithdrawsController],
  providers: [UserWithdrawsService, UserWithdrawsRepository],
})
export class UserWithdrawModule {}
