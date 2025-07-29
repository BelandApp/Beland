import { Module } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { PrizesController } from './prizes.controller';

@Module({
  controllers: [PrizesController],
  providers: [PrizesService],
})
export class PrizesModule {}
