import { Module } from '@nestjs/common';
import { ResourcesTypesService } from './resources-types.service';
import { ResourcesTypesController } from './resources-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesType } from './entities/resources-type.entity';
import { ResourcesTypesRepository } from './resources-types.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ResourcesType])],
  controllers: [ResourcesTypesController],
  providers: [ResourcesTypesService, ResourcesTypesRepository],
})
export class ResourcesTypesModule {}
