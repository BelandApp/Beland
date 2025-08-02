import { Module } from '@nestjs/common';
import { DatabaseInitService } from './database-init.service';
import { DefaultRolesSeeder } from './seeders/default-roles.seeder';
import { SuperAdminUserSeeder } from './seeders/superadmin-user.seeder';
import { RolesModule } from '../../roles/roles.module'; // Ruta relativa ajustada
import { UsersModule } from '../../users/users.module'; // Ruta relativa ajustada
import { ConfigModule } from '@nestjs/config'; // Necesario para ConfigService

@Module({
  imports: [
    RolesModule,
    UsersModule,
    ConfigModule, // Asegúrate de que ConfigModule esté importado aquí o globalmente
  ],
  providers: [
    DatabaseInitService,
    DefaultRolesSeeder,
    SuperAdminUserSeeder,
    // Aquí puedes añadir otros servicios de inicialización general si los tuvieras
  ],
  exports: [DatabaseInitService],
})
export class DatabaseInitModule {}
