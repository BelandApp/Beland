import { Module } from '@nestjs/common';
import { ResourcesTypesService } from './resources-types.service';
import { ResourcesTypesController } from './resources-types.controller';

@Module({
  controllers: [ResourcesTypesController],
  providers: [ResourcesTypesService],
})
export class ResourcesTypesModule {}
