import { Module } from '@nestjs/common';
import { UserCardsService } from './user-cards.service';
import { UserCardsController } from './user-cards.controller';

@Module({
  controllers: [UserCardsController],
  providers: [UserCardsService],
})
export class UserCardsModule {}
