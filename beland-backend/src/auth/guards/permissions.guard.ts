// src/auth/guards/permissions.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  AdminPermission,
} from '../decorators/permissions.decorator'; // Importar la clave y el tipo de permiso
import { User } from 'src/users/entities/users.entity'; // Importar la entidad User
import { AdminService } from 'src/admins/admins.service'; // Importar AdminService
import { Admin } from 'src/admins/entities/admin.entity'; // Importar la entidad Admin

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly adminService: AdminService, // Inyectar AdminService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener los permisos requeridos de los metadatos de la ruta
    const requiredPermissions = this.reflector.getAllAndOverride<
      AdminPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // Si no hay permisos requeridos, permitir el acceso
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Asumimos que el JwtAuthGuard ya ha adjuntado el usuario completo a la request.
    const user: User = request.user;

    this.logger.debug(`Permisos requeridos: ${requiredPermissions.join(', ')}`);
    this.logger.debug(`Usuario autenticado (ID): ${user ? user.id : 'N/A'}`);

    // Si no hay usuario, denegar acceso
    if (!user) {
      this.logger.warn('Acceso denegado: Usuario no autenticado.');
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud.',
      );
    }
    //JOHN ACA CONVIENE CONSULTAR A USER.ROLE_RELATIONS.NAME. Y QUE ELIMINEMOS ROLE_NAME DE USER AL CREAR EL USUARIO NO CARGO ESTA VARIALBLE... SOLO ASIGNO LA RELACION
    // Si el usuario no es ADMIN o SUPERADMIN, no tiene permisos administrativos granulares
    if (user.role_name !== 'ADMIN' && user.role_name !== 'SUPERADMIN') {
      this.logger.warn(
        `Acceso denegado: Usuario "${user.email}" no es Admin o Superadmin.`,
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud.',
      );
    }

    // Obtener la entrada de administrador para el usuario
    // Usamos findByUserIdInternal que busca por el ID (PK) del usuario
    const adminEntry: Admin | null =
      await this.adminService.findByUserIdInternal(user.id);

    if (!adminEntry) {
      this.logger.warn(
        `Acceso denegado: No se encontró entrada de admin para el usuario ID "${user.id}".`,
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud.',
      );
    }

    // Verificar si el administrador tiene TODOS los permisos requeridos
    const hasAllRequiredPermissions = requiredPermissions.every(
      (permission) => {
        // Asegurarse de que la propiedad existe y es verdadera
        return adminEntry[permission] === true;
      },
    );

    if (!hasAllRequiredPermissions) {
      this.logger.warn(
        `Acceso denegado: Admin "${user.id}" no tiene todos los permisos requeridos.`,
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud.',
      );
    }

    return true;
  }
}
