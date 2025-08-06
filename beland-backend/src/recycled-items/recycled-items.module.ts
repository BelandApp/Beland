import { Module } from '@nestjs/common';
import { RecycledItemsService } from './recycled-items.service';
import { RecycledItemsController } from './recycled-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecycledItem } from './entities/recycled-item.entity';
import { RecycledItemsRepository } from './recycled-items.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RecycledItem])],
  controllers: [RecycledItemsController],
  providers: [RecycledItemsService, RecycledItemsRepository],
})
export class RecycledItemsModule {}
