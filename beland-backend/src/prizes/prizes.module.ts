import { Module } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { PrizesController } from './prizes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prize } from './entities/prize.entity';
import { PrizesRepository } from './prizes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Prize])],
  controllers: [PrizesController],
  providers: [PrizesService, PrizesRepository],
})
export class PrizesModule {}
