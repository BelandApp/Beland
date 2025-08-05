import { Module } from '@nestjs/common';
import { RecyclePricesService } from './recycle_prices.service';
import { RecyclePricesController } from './recycle_prices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecyclePrice } from './entities/recycle_price.entity';
import { RecyclePricesRepository } from './recycle_prices.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RecyclePrice])],
  controllers: [RecyclePricesController],
  providers: [RecyclePricesService, RecyclePricesRepository],
})
export class RecyclePricesModule {}
