import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { ResourcesRepository } from './resources.repository.';

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourcesRepository],
})
export class ResourcesModule {}
