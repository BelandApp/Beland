// src/group-members/group-members.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMembersService } from './group-members.service';
import { GroupMembersController } from './group-members.controller';
import { GroupMember } from './entities/group-member.entity';
import { GroupMembersRepository } from './group-members.repository';
import { GroupsModule } from 'src/groups/groups.module'; // Import GroupsModule for GroupsService dependency
import { User } from 'src/users/entities/users.entity';
import { UsersModule } from 'src/users/users.module';
import { AdminsModule } from 'src/admins/admins.module';
import { GroupInvitationsModule } from 'src/group-invitations/group-invitations.module';

@Module({
  imports: [
    // Register TypeORM entities. User is needed as GroupMembersService depends on it.
    TypeOrmModule.forFeature([GroupMember, User]),
    // Use forwardRef to resolve circular dependencies.
    forwardRef(() => GroupsModule), // Allows GroupMembersService to inject GroupsService
    forwardRef(() => UsersModule), // Allows GroupMembersService to inject UsersService
    forwardRef(() => AdminsModule), // <-- ADDED THIS LINE to resolve PermissionsGuard dependency
    forwardRef(() => GroupInvitationsModule),
  ],
  controllers: [GroupMembersController], // Register controllers
  providers: [GroupMembersService, GroupMembersRepository], // Register services and repositories
  // Export services and repositories for use in other modules.
  exports: [GroupMembersService, GroupMembersRepository, TypeOrmModule],
})
export class GroupMembersModule {}
