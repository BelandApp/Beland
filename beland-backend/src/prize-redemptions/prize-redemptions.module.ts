import { Module } from '@nestjs/common';
import { PrizeRedemptionsService } from './prize-redemptions.service';
import { PrizeRedemptionsController } from './prize-redemptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrizeRedemption } from './entities/prize-redemption.entity';
import { PrizeRedemptionsRepository } from './prize-redemptions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PrizeRedemption])],
  controllers: [PrizeRedemptionsController],
  providers: [PrizeRedemptionsService, PrizeRedemptionsRepository],
})
export class PrizeRedemptionsModule {}
