import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DefaultRolesSeeder } from '../init/seeders/default-roles.seeder'; // Ruta relativa ajustada
import { SuperAdminUserSeeder } from '../init/seeders/superadmin-user.seeder'; // Ruta relativa ajustada
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

dotenv.config(); // Cargar variables de entorno desde .env

async function bootstrap() {
  const logger = new Logger('SeedInitialData');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const defaultRolesSeeder = app.get(DefaultRolesSeeder);
    const superAdminUserSeeder = app.get(SuperAdminUserSeeder);

    logger.log('⏳ Ejecutando siembra de roles iniciales...');
    await defaultRolesSeeder.seed();
    logger.log('✅ Siembra de roles completada.');

    logger.log('⏳ Ejecutando siembra de usuario SUPERADMIN...');
    await superAdminUserSeeder.seed();
    logger.log('✅ Siembra de usuario SUPERADMIN completada.');
  } catch (error: any) {
    logger.error(
      `❌ Error durante la ejecución del seeder manual: ${error.message}`,
      error.stack,
    );
  } finally {
    await app.close();
  }
}

void bootstrap();
