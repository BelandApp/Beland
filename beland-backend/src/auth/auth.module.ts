// src/auth/auth.module.ts
import { Global, Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule, JwtService } from '@nestjs/jwt'; // JwtModule es necesario aquí
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
import { RolesModule } from 'src/roles/roles.module'; // Importa RolesModule si AuthService inyecta RolesRepository

import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.register({}),
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule), // Asegúrate de importar RolesModule si es necesario para RolesRepository
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // ¡IMPORTANTE! Agrega JwtModule a los imports aquí.
    // Usamos registerAsync para obtener JWT_SECRET de ConfigService.
    JwtModule.registerAsync({
      imports: [ConfigModule], // Necesario para inyectar ConfigService
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'fallback_secret_for_dev_if_not_set',
        signOptions: { expiresIn: '1h' },
      }),
    }),
    TypeOrmModule.forFeature([User, Role, Wallet]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UsersRepository,
    RolesRepository,
    WalletsRepository,
    AuthenticationGuard,
    JwtAuthGuard,
    FlexibleAuthGuard,
  ],
  exports: [
    AuthService,
    AuthenticationGuard,
    JwtAuthGuard,
    FlexibleAuthGuard,
    JwtModule, // Ahora sí puedes exportar JwtModule porque está importado
    UsersRepository,
    RolesRepository,
    WalletsRepository,
  ],
})
export class AuthModule {}
