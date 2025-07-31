import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { RolesRepository } from '../roles/roles.repository';
// Eliminada la importación de SettingRepository, ya que no se usa o no existe en el contexto actual.

@Injectable()
export class DataSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DataSeederService.name);
  private readonly DEFAULT_ROLES = [
    { name: 'USER', description: 'Usuario básico del sistema' },
    { name: 'LEADER', description: 'Usuario con privilegios de líder' },
    { name: 'ADMIN', description: 'Administrador del sistema' },
    { name: 'SUPERADMIN', description: 'Superadministrador con control total' },
  ];

  constructor(
    private readonly rolesRepository: RolesRepository,
    // Eliminado SettingRepository del constructor
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultRoles();
  }

  private async seedDefaultRoles() {
    this.logger.log('Verificando y sembrando roles por defecto...');

    for (const roleData of this.DEFAULT_ROLES) {
      const existingRole = await this.rolesRepository.findByName(
        roleData.name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
      );

      if (!existingRole) {
        try {
          // Asegurarse de que el objeto pasado a create sea compatible con DeepPartial<Role>
          // y que se use 'await' para la creación
          const newRole = await this.rolesRepository.save(
            await this.rolesRepository.create({
              name: roleData.name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
              description: roleData.description,
              is_active: true, // Ahora la entidad Role tiene esta propiedad
            }),
          );
          this.logger.log(
            `Rol "${newRole.name}" (ID: ${newRole.role_id}) sembrado exitosamente.`,
          );
        } catch (error: any) {
          // Usar 'any' para acceder a 'error.message'
          this.logger.error(
            `Error creando rol "${roleData.name}": ${error.message}`,
          );
        }
      } else {
        this.logger.debug(`Rol "${roleData.name}" ya existe.`);
      }
    }
  }
}
