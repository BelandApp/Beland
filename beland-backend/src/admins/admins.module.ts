import { Module, forwardRef } from '@nestjs/common'; // Asegúrate de que forwardRef esté importado
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminsController } from './admins.controller';
import { AdminService } from './admins.service';
import { AdminRepository } from './admins.repository';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module'; // Importa RolesModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
  ],
  controllers: [AdminsController],
  providers: [AdminService, AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminsModule {}
