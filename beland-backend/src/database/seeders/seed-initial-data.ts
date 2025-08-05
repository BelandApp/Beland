// src/database/seeders/seed-initial-data.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { RolesRepository } from 'src/roles/roles.repository'; // Importación corregida
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

dotenv.config(); // Cargar variables de entorno desde .env

async function bootstrap() {
  const logger = new Logger('SeedInitialData');

  const app = await NestFactory.createApplicationContext(AppModule);

  const rolesRepository = app.get(RolesRepository);
  const usersService = app.get(UsersService);

  const roles = ['USER', 'LEADER', 'ADMIN', 'SUPERADMIN'];
  logger.log('⏳ Verificando y creando roles iniciales...');
  for (const name of roles) {
    const existingRole = await rolesRepository.findByName(
      name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
    );
    if (!existingRole) {
      await rolesRepository.save(
        rolesRepository.create({
          name: name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
          description: `Rol ${name}`,
          is_active: true,
        }),
      );
      logger.log(`✅ Rol creado: ${name}`);
    } else {
      logger.log(`ℹ️ Rol ya existe: ${name}`);
    }
  }

  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD;
  const superAdminFullName =
    process.env.SUPERADMIN_FULL_NAME || 'Super Administrador';
  const superAdminUsername =
    process.env.SUPERADMIN_USERNAME || 'superadmin_user';
  const superAdminAddress =
    process.env.SUPERADMIN_ADDRESS || 'Dirección Secreta';
  const superAdminPhone = process.env.SUPERADMIN_PHONE
    ? parseInt(process.env.SUPERADMIN_PHONE, 10)
    : 1234567890;
  const superAdminCountry = process.env.SUPERADMIN_COUNTRY || 'País';
  const superAdminCity = process.env.SUPERADMIN_CITY || 'Ciudad';

  if (!superAdminEmail || !superAdminPassword) {
    logger.error(
      '❌ Variables de entorno SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no definidas. No se puede crear el superadmin.',
    );
    await app.close();
    return;
  }

  const existingAdmin = await usersService.findByEmail(superAdminEmail);
  if (existingAdmin) {
    logger.log('ℹ️ El superadmin ya existe. No se crea uno nuevo.');
  } else {
    logger.log('⏳ Creando usuario superadmin...');
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superadminDto: CreateUserDto = {
      email: superAdminEmail,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      full_name: superAdminFullName,
      address: superAdminAddress,
      phone: superAdminPhone,
      country: superAdminCountry,
      city: superAdminCity,
      isBlocked: false, // Asegurado que esté presente
      deleted_at: null,
      oauth_provider: null,
      username: superAdminUsername,
      profile_picture_url: '',
      role: 'SUPERADMIN',
    };

    await usersService.createInitialUser(superadminDto);
    logger.log('✅ Usuario SUPERADMIN creado con éxito.');
  }

  await app.close();
}

void bootstrap();
