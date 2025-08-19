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
} from '../decorators/permissions.decorator';
import { User } from 'src/users/entities/users.entity';
import { AdminService } from 'src/admins/admins.service';
import { Admin } from 'src/admins/entities/admin.entity'; // Importación de la entidad Admin

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly adminService: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener los permisos requeridos de los metadatos de la ruta
    const requiredPermissions = this.reflector.getAllAndOverride<
      AdminPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // Si no hay permisos requeridos, permitir el acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.logger.debug(
        'PermissionsGuard: No hay permisos requeridos definidos para esta ruta. Acceso concedido por defecto.',
      );
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Asumimos que un guardia de autenticación previo ya adjuntó el usuario

    this.logger.debug(
      `PermissionsGuard: Permisos requeridos para la ruta: [${requiredPermissions.join(
        ', ',
      )}]`,
    );
    this.logger.debug(
      `PermissionsGuard: Rol del usuario autenticado: ${
        user ? user.role_name : 'N/A'
      } (ID: ${user ? user.id : 'N/A'})`,
    );

    // Si no hay usuario, denegar acceso (esto debería ser manejado por FlexibleAuthGuard principalmente)
    if (!user) {
      this.logger.warn(
        'PermissionsGuard: Acceso denegado. Usuario no autenticado.',
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud. (Usuario no autenticado)',
      );
    }

    // ---- Lógica de BYPASS para SUPERADMIN ----
    if (user.role_name === 'SUPERADMIN') {
      this.logger.log(
        `PermissionsGuard: Usuario ${user.email} es SUPERADMIN. Concediendo acceso total (se salta la verificación de permisos granulares).`,
      );
      return true; // ¡El SUPERADMIN tiene acceso a todo!
    }
    // ------------------------------------------

    // Si el usuario no es ADMIN (y no es SUPERADMIN, ya cubierto por el bypass), no tiene permisos administrativos granulares.
    if (user.role_name !== 'ADMIN') {
      this.logger.warn(
        `PermissionsGuard: Acceso denegado. El usuario "${user.email}" (Rol: ${user.role_name}) no es un Administrador.`,
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud. (Rol insuficiente para permisos granulares)',
      );
    }

    // Obtener la entrada de administrador para el usuario
    const adminEntry: Admin | null =
      await this.adminService.findByUserIdInternal(user.id);

    if (!adminEntry) {
      this.logger.warn(
        `PermissionsGuard: Acceso denegado. No se encontró entrada de administrador para el usuario ID "${user.id}" con rol ADMIN.`,
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud. (No se encontró perfil de administrador asociado)',
      );
    }

    // Verificar si el administrador tiene TODOS los permisos requeridos
    const hasAllRequiredPermissions = requiredPermissions.every(
      (permission) => {
        // Acceder a la propiedad directamente con el string del permiso
        return adminEntry[permission] === true;
      },
    );

    if (!hasAllRequiredPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (p) => adminEntry[p] !== true,
      );
      this.logger.warn(
        `PermissionsGuard: Acceso denegado. El administrador "${
          user.id
        }" no tiene todos los permisos requeridos. Permisos faltantes: [${missingPermissions.join(
          ', ',
        )}].`,
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud. (Permisos granulares insuficientes)',
      );
    }

    this.logger.debug(
      `PermissionsGuard: Acceso concedido. El administrador tiene todos los permisos requeridos.`,
    );
    return true;
  }
}
