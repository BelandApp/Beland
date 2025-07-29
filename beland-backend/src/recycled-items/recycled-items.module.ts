import { Module } from '@nestjs/common';
import { RecycledItemsService } from './recycled-items.service';
import { RecycledItemsController } from './recycled-items.controller';

@Module({
  controllers: [RecycledItemsController],
  providers: [RecycledItemsService],
})
export class RecycledItemsModule {}
