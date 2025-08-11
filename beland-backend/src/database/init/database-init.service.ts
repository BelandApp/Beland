import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DefaultRolesSeeder } from './seeders/default-roles.seeder';
import { SuperAdminUserSeeder } from './seeders/superadmin-user.seeder';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    private readonly defaultRolesSeeder: DefaultRolesSeeder,
    private readonly superAdminUserSeeder: SuperAdminUserSeeder,
  ) {}

  async onModuleInit() {
    this.logger.log(
      '🚀 Iniciando todos los procesos de inicialización de la aplicación...',
    );
    
    try {
      await this.defaultRolesSeeder.seed();
      await this.superAdminUserSeeder.seed();
      this.logger.log(
        '✅ Todos los procesos de inicialización completados exitosamente.',
      );
    } catch (error: any) {
      this.logger.error(
        `❌ Error durante la inicialización de la aplicación: ${error.message}`,
        error.stack,
      );
    }
  }
}
