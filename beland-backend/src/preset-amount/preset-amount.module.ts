import { Module } from '@nestjs/common';
import { PresetAmountsService } from './preset-amount.service';
import { PresetAmountsController } from './preset-amount.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresetAmount } from './entities/preset-amount.entity';
import { PresetAmountsRepository } from './preset-amount.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PresetAmount])],
  controllers: [PresetAmountsController],
  providers: [PresetAmountsService, PresetAmountsRepository],
})
export class PresetAmountModule {}
