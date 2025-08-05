import { Module } from '@nestjs/common';
import { CharityService } from './charity.service';
import { CharityController } from './charity.controller';

@Module({
  controllers: [CharityController],
  providers: [CharityService],
})
export class CharityModule {}
