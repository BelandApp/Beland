import { Module } from '@nestjs/common';
import { UserCardsService } from './user-cards.service';
import { UserCardsController } from './user-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCard } from './entities/user-card.entity';
import { UserCardsRepository } from './user-cards.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserCard])],
  controllers: [UserCardsController],
  providers: [UserCardsService, UserCardsRepository],
})
export class UserCardsModule {}
