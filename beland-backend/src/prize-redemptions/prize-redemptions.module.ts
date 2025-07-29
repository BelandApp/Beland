import { Module } from '@nestjs/common';
import { PrizeRedemptionsService } from './prize-redemptions.service';
import { PrizeRedemptionsController } from './prize-redemptions.controller';

@Module({
  controllers: [PrizeRedemptionsController],
  providers: [PrizeRedemptionsService],
})
export class PrizeRedemptionsModule {}
