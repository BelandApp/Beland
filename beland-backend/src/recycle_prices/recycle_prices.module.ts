import { Module } from '@nestjs/common';
import { RecyclePricesService } from './recycle_prices.service';
import { RecyclePricesController } from './recycle_prices.controller';

@Module({
  controllers: [RecyclePricesController],
  providers: [RecyclePricesService],
})
export class RecyclePricesModule {}
