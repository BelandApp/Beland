import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../../users/users.service'; // Ruta relativa ajustada
import { CreateUserDto } from '../../../users/dto/create-user.dto'; // Ruta relativa ajustada
import { AuthService } from 'src/auth/auth.service';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Role } from 'src/roles/entities/role.entity';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';

@Injectable()
export class SuperAdminUserSeeder {
  private readonly logger = new Logger(SuperAdminUserSeeder.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    public dataSource: DataSource,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('👑 Verificando y creando usuario SUPERADMIN...');

    const superAdminEmail = this.configService.get<string>('SUPERADMIN_EMAIL');
    const superAdminPassword = this.configService.get<string>(
      'SUPERADMIN_PASSWORD',
    );
    const superAdminFullName =
      this.configService.get<string>('SUPERADMIN_FULL_NAME') ||
      'Super Administrador';
    const superAdminUsername =
      this.configService.get<string>('SUPERADMIN_USERNAME') ||
      'superadmin_user';
    const superAdminAddress =
      this.configService.get<string>('SUPERADMIN_ADDRESS') ||
      'Dirección Secreta';
    const superAdminPhoneStr =
      this.configService.get<string>('SUPERADMIN_PHONE');
    const superAdminPhone = superAdminPhoneStr
      ? parseInt(superAdminPhoneStr, 10)
      : 0;
    const superAdminCountry =
      this.configService.get<string>('SUPERADMIN_COUNTRY') || 'País';
    const superAdminCity =
      this.configService.get<string>('SUPERADMIN_CITY') || 'Ciudad';

    if (!superAdminEmail || !superAdminPassword) {
      this.logger.error(
        '❌ Variables de entorno SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no definidas. No se puede crear el superadmin.',
      );
      return;
    }

    const roleRepo = this.dataSource.getRepository(Role);
    const role:Role = await roleRepo.findOne({where: {name: 'SUPERADMIN'}})
    const userRepo = this.dataSource.getRepository(User);
    const user:User = await userRepo.findOne({where: {role_name: 'SUPERADMIN'}})
    if (user) {
      return;
    }
    const superAdminData: CreateUserDto = {
      email: superAdminEmail,
      full_name: superAdminFullName,
      username: superAdminUsername,
      oauth_provider: null,
      role_name: role.name,
      password: superAdminPassword,
      confirmPassword: superAdminPassword,
      address: superAdminAddress,
      phone: superAdminPhone,
      country: superAdminCountry,
      city: superAdminCity,
      isBlocked: false,
      deleted_at: null,
      profile_picture_url: '',
    };
   
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); 

    try {
      
      const newUser = await queryRunner.manager.save(User, {...superAdminData, role_id: role.role_id});
      await this.authService.createWalletAndCart(queryRunner, newUser);
      await queryRunner.commitTransaction();
      this.logger.log(
        `✅ Usuario SUPERADMIN creado exitosamente: ${superAdminEmail}`,
      );
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      // Asumiendo que UsersService.create lanza ConflictException si el usuario ya existe
      if (error instanceof ConflictException) {
        this.logger.log(`ℹ️ Usuario SUPERADMIN ya existe: ${superAdminEmail}`); // Log informativo
      } else {
        this.logger.error(
          `❌ Error creando usuario SUPERADMIN:`,
          error.message,
          error.stack,
        );
        throw new InternalServerErrorException(
          `Error al crear el usuario SUPERADMIN: ${error.message}`,
        );
      }
    } finally {
      await queryRunner.release();
    }
  }
}
