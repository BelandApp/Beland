import { Module } from '@nestjs/common';
import { UserResourcesService } from './user-resources.service';
import { UserResourcesController } from './user-resources.controller';

@Module({
  controllers: [UserResourcesController],
  providers: [UserResourcesService],
})
export class UserResourcesModule {}
