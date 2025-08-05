import { Module } from '@nestjs/common';
import { CharitiesService } from './charity.service';
import { CharitiesController } from './charity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charity } from './entities/charity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Charity])],
  controllers: [CharitiesController],
  providers: [CharitiesService],
})
export class CharityModule {}
