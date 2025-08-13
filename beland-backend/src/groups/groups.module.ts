// src/groups/groups.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './entities/group.entity';
import { GroupsRepository } from './groups.repository';
import { GroupMember } from '../group-members/entities/group-member.entity';
import { GroupMembersRepository } from '../group-members/group-members.repository';
import { UsersModule } from 'src/users/users.module'; // Import UsersModule for UsersService dependency
import { User } from 'src/users/entities/users.entity'; // Import User entity for TypeOrmModule.forFeature
import { AuthModule } from 'src/auth/auth.module'; // Import AuthModule for authentication/authorization guards
import { AdminsModule } from 'src/admins/admins.module'; // Import AdminsModule
import { GroupMembersModule } from 'src/group-members/group-members.module';
import { GroupInvitationsModule } from 'src/group-invitations/group-invitations.module';

@Module({
  imports: [
    // Register TypeORM entities for this module. GroupMember and User are needed for relationships.
    TypeOrmModule.forFeature([Group, GroupMember, User]),
    // Use forwardRef to resolve circular dependencies if UsersModule or AuthModule also import GroupsModule.
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => AdminsModule),
    forwardRef(() => GroupMembersModule), // <-- ADDED THIS LINE to resolve PermissionsGuard dependency
    forwardRef(() => GroupInvitationsModule),
  ],
  controllers: [GroupsController], // Register controllers handled by this module
  providers: [GroupsService, GroupsRepository, GroupMembersRepository], // Register services and repositories as providers
  // Export services and repositories so other modules can inject them.
  exports: [
    GroupsService,
    GroupsRepository,
    GroupMembersRepository,
    TypeOrmModule,
  ],
})
export class GroupsModule {}
