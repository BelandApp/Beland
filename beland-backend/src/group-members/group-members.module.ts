import { Module } from '@nestjs/common';
import { GroupMembersService } from './group-members.service';
import { GroupMembersController } from './group-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMember } from './entities/group-member.entity';
import { GroupMembersRepository } from './group-members.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMember])],
  controllers: [GroupMembersController],
  providers: [GroupMembersService, GroupMembersRepository],
})
export class GroupMembersModule {}
