import {
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common'; // Importar NotFoundException
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateRoleDto } from '../roles/dto/create-role.dto';

@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 Iniciando proceso de inicialización...');

    try {
      // 1. Crear roles por defecto
      await this.createDefaultRoles();

      // 2. Crear usuario SUPERADMIN
      await this.createSuperAdmin();

      this.logger.log('✅ Inicialización completada exitosamente');
    } catch (error: any) {
      // Capturar cualquier error inesperado durante la inicialización
      this.logger.error(
        '❌ Error durante la inicialización:',
        error.message,
        error.stack,
      );
    }
  }

  private async createDefaultRoles() {
    this.logger.log('📋 Creando roles por defecto...');

    const defaultRoles: CreateRoleDto[] = [
      {
        name: 'USER',
        description: 'Usuario básico del sistema',
        is_active: true,
      },
      {
        name: 'LEADER',
        description: 'Líder de grupo',
        is_active: true,
      },
      {
        name: 'ADMIN',
        description: 'Administrador del sistema',
        is_active: true,
      },
      {
        name: 'SUPERADMIN',
        description: 'Super administrador del sistema',
        is_active: true,
      },
    ];

    for (const roleData of defaultRoles) {
      try {
        await this.rolesService.create(roleData);
        this.logger.log(`✅ Rol "${roleData.name}" creado exitosamente`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          this.logger.log(`ℹ️ Rol "${roleData.name}" ya existe`);
        } else {
          this.logger.error(
            `❌ Error creando rol "${roleData.name}":`,
            error.message,
            error.stack,
          );
        }
      }
    }
  }

  private async createSuperAdmin() {
    this.logger.log('👑 Creando usuario SUPERADMIN...');

    const superAdminEmail = 'belandproject@gmail.com'; // Hardcodeado para el seeder automático de InitService

    try {
      // Intentar buscar el usuario. Si no existe, findByEmail lanzará NotFoundException.
      await this.usersService.findByEmail(superAdminEmail);
      this.logger.log(`ℹ️ Usuario SUPERADMIN ya existe: ${superAdminEmail}`);
      return; // Si lo encuentra, salir.
    } catch (error) {
      // Si el error es NotFoundException, significa que el usuario no existe, ¡así que lo creamos!
      if (error instanceof NotFoundException) {
        this.logger.log(
          `Usuario SUPERADMIN "${superAdminEmail}" no encontrado, procediendo a crearlo.`,
        );
      } else {
        // Si es otro tipo de error, es un problema real.
        this.logger.error(
          `❌ Error inesperado al buscar usuario SUPERADMIN:`,
          error,
        );
        throw error; // Relanzar el error si no es NotFoundException
      }
    }

    // Si llegamos aquí, significa que el usuario no fue encontrado y podemos crearlo.
    const superAdminData: CreateUserDto = {
      email: superAdminEmail,
      full_name: 'Beland Project Super Admin',
      username: 'beland_admin',
      oauth_provider: null,
      role: 'SUPERADMIN',
      password: 'temp_password_for_superadmin', // ¡Cambiar en producción!
      confirmPassword: 'temp_password_for_superadmin',
      address: 'Dirección del proyecto Beland',
      phone: 0,
      country: 'Colombia',
      city: 'Bogotá',
      isBlocked: false,
      deleted_at: null,
    };

    try {
      // create() en UsersService ya maneja el hashing y la asignación del rol
      await this.usersService.create(superAdminData);
      this.logger.log(
        `✅ Usuario SUPERADMIN creado exitosamente: ${superAdminEmail}`,
      );
    } catch (error: any) {
      this.logger.error(
        `❌ Error creando usuario SUPERADMIN:`,
        error.message,
        error.stack,
      );
    }
  }
}
