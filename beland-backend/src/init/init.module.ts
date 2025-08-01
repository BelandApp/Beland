import { Module } from '@nestjs/common';
import { InitService } from './init.service';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [UsersModule, RolesModule],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
