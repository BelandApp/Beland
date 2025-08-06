import { Module } from '@nestjs/common';
import { CharitiesService } from './charity.service';
import { CharitiesController } from './charity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charity } from './entities/charity.entity';
import { CharitiesRepository } from './charity.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Charity])],
  controllers: [CharitiesController],
  providers: [CharitiesService, CharitiesRepository],
})
export class CharityModule {}
