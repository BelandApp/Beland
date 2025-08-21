import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { RolesRepository } from './roles.repository';
import { User } from '../users/entities/users.entity';
import { UsersModule } from 'src/users/users.module';
import { AdminsModule } from 'src/admins/admins.module'; // Importa AdminsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User]),
    forwardRef(() => UsersModule),
    forwardRef(() => AdminsModule),
  ],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesService, RolesRepository, TypeOrmModule],
})
export class RolesModule {}
