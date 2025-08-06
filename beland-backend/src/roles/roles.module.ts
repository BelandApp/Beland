import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { RolesRepository } from './roles.repository'; // Importación corregida
import { User } from '../users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User])],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesService, RolesRepository, TypeOrmModule],
})
export class RolesModule {}
