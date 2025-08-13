// src/group-invitations/group-invitations.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupInvitation } from './entities/group-invitation.entity';
import { GroupInvitationsService } from './group-invitations.service';
import { GroupInvitationsController } from './group-invitations.controller';
import { UsersModule } from 'src/users/users.module';
import { GroupsModule } from 'src/groups/groups.module';
import { GroupMembersModule } from 'src/group-members/group-members.module';
import { User } from 'src/users/entities/users.entity';
import { GroupInvitationsRepository } from './group-invitations.repository';
import { AdminsModule } from 'src/admins/admins.module'; // CORRECTED: Import AdminsModule
import { InvitationCleanupService } from './invitation-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupInvitation, User]),
    forwardRef(() => UsersModule),
    forwardRef(() => GroupsModule),
    forwardRef(() => GroupMembersModule),
    forwardRef(() => AdminsModule),
  ],
  controllers: [GroupInvitationsController],
  providers: [
    GroupInvitationsService,
    GroupInvitationsRepository,
    InvitationCleanupService],
  exports: [GroupInvitationsService, GroupInvitationsRepository, TypeOrmModule],
})
export class GroupInvitationsModule {}
