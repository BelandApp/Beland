import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletsRepository } from './wallets.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), HttpModule],
  controllers: [WalletsController],
  providers: [WalletsService, WalletsRepository],
})
export class WalletsModule {}
