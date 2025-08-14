import { Module } from '@nestjs/common';
import { GroupTypeService } from './group-type.service';
import { GroupTypeController } from './group-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupType } from './entities/group-type.entity';
import { GroupTypeRepository } from './group-type.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GroupType])],
  controllers: [GroupTypeController],
  providers: [GroupTypeService, GroupTypeRepository],
})
export class GroupTypeModule {}
