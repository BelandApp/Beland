import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersRepository } from 'src/users/users.repository';
import { RolesRepository } from 'src/roles/roles.repository';
import { WalletsRepository } from 'src/wallets/wallets.repository';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.register({}), // usa HttpModule.register({}) en version @nestjs/axios >= 10
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Role, Wallet])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersRepository, RolesRepository, WalletsRepository, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
