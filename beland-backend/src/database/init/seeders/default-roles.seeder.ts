import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../../../roles/roles.service'; // Ruta relativa ajustada
import { CreateRoleDto } from '../../../roles/dto/create-role.dto'; // Ruta relativa ajustada

@Injectable()
export class DefaultRolesSeeder {
  private readonly logger = new Logger(DefaultRolesSeeder.name);

  constructor(
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('📋 Verificando y sembrando roles por defecto...');

    let defaultRoles: CreateRoleDto[];
    try {
      const rolesConfigString = this.configService.get<string>(
        'DEFAULT_ROLES_CONFIG',
      );
      if (!rolesConfigString) {
        this.logger.warn(
          'La variable de entorno DEFAULT_ROLES_CONFIG no está definida. No se sembrarán roles por defecto.',
        );
        return;
      }
      defaultRoles = JSON.parse(rolesConfigString);
      if (
        !Array.isArray(defaultRoles) ||
        defaultRoles.some((r) => !r.name || typeof r.is_active === 'undefined')
      ) {
        throw new Error(
          'La configuración de roles no es un array válido de objetos de rol.',
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Error al parsear DEFAULT_ROLES_CONFIG: ${error.message}. Asegúrate de que sea un JSON válido.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Error de configuración de roles por defecto.',
      );
    }

    for (const roleData of defaultRoles) {
      try {
        await this.rolesService.create(roleData);
        this.logger.log(`✅ Rol "${roleData.name}" creado exitosamente`);
      } catch (error: any) {
        // Asumiendo que RolesService.create lanza ConflictException si el rol ya existe
        if (error instanceof ConflictException) {
          this.logger.log(`ℹ️ Rol "${roleData.name}" ya existe`); // Log informativo, no de error
        } else {
          this.logger.error(
            `❌ Error creando rol "${roleData.name}": ${error.message}`,
            error.stack,
          );
        }
      }
    }
  }
}
