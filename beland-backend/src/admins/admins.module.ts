import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminsController } from './admins.controller';
import { AdminService } from './admins.service';
import { AdminRepository } from './admins.repository';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    forwardRef(() => UsersModule),
    RolesModule,
  ],
  controllers: [AdminsController],
  providers: [AdminService, AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminsModule {}
