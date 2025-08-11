// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt'; // JwtModule es necesario aquí
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades necesarias para TypeOrmModule.forFeature en este módulo
import { User } from 'src/users/entities/users.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Role } from 'src/roles/entities/role.entity';

// Servicios y Repositorios
import { AuthService } from './auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { RolesRepository } from 'src/roles/roles.repository';
import { WalletsRepository } from 'src/wallets/wallets.repository';

// Estrategias y Guards
import { JwtStrategy } from './jwt.strategy';
import { AuthenticationGuard } from './guards/auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FlexibleAuthGuard } from './guards/flexible-auth.guard';

// Módulos externos que proveen dependencias
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';

import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.register({}),
    // Uso de forwardRef para resolver posibles dependencias circulares
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
    // Configura Passport para usar la estrategia 'jwt' por defecto
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // ¡IMPORTANTE! Agrega JwtModule a los imports aquí.
    // Usamos registerAsync para obtener JWT_SECRET de ConfigService de forma asíncrona.
    JwtModule.registerAsync({
      imports: [ConfigModule], // Necesario para inyectar ConfigService
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'fallback_secret_for_dev_if_not_set', // Clave secreta para firmar tokens JWT locales
        signOptions: { expiresIn: '1h' }, // Tiempo de expiración para tokens locales
      }),
    }),
    // Registra las entidades de TypeORM necesarias para este módulo
    TypeOrmModule.forFeature([User, Role, Wallet]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // Estrategia de Auth0
    UsersRepository,
    RolesRepository,
    WalletsRepository,
    // JwtService ya no es necesario listarlo aquí explícitamente,
    // ya que JwtModule (importado arriba) lo provee automáticamente.
    AuthenticationGuard, // Guard de autenticación local
    JwtAuthGuard, // Guard de autenticación de Auth0
    FlexibleAuthGuard, // Guard que combina ambos
  ],
  exports: [
    AuthService,
    AuthenticationGuard,
    JwtAuthGuard,
    FlexibleAuthGuard,
    JwtModule, // Se exporta correctamente porque está importado en este módulo
    UsersRepository,
    RolesRepository,
    WalletsRepository,
  ],
})
export class AuthModule {}
