import { Module } from '@nestjs/common';
import { UserResourcesService } from './user-resources.service';
import { UserResourcesController } from './user-resources.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserResource } from './entities/user-resource.entity';
import { UserResourcesRepository } from './user-resources.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserResource])],
  controllers: [UserResourcesController],
  providers: [UserResourcesService, UserResourcesRepository],
})
export class UserResourcesModule {}
