// src/auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos de los metadatos de la ruta
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir el acceso
    if (!requiredRoles) {
      this.logger.debug(
        'RolesGuard: No hay roles requeridos definidos para esta ruta. Acceso concedido por defecto.',
      );
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Asumimos que un guardia de autenticación previo ya ha adjuntado el usuario completo a la request.
    const user: User = request.user;

    this.logger.debug(
      `RolesGuard: Roles requeridos para la ruta: [${requiredRoles.join(
        ', ',
      )}]`,
    );
    this.logger.debug(
      `RolesGuard: Rol del usuario autenticado: ${
        user ? user.role_name : 'N/A'
      }`,
    );

    // Si no hay usuario autenticado o no tiene un rol, denegar acceso
    if (!user || !user.role_name) {
      this.logger.warn(
        'RolesGuard: Acceso denegado. Usuario no autenticado o sin rol asignado.',
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud. (Rol no encontrado)',
      );
    }

    // ---- Lógica de BYPASS para SUPERADMIN ----
    if (user.role_name === 'SUPERADMIN') {
      this.logger.log(
        `RolesGuard: Usuario ${user.email} es SUPERADMIN. Concediendo acceso total (se salta la verificación de roles).`,
      );
      return true; // ¡El SUPERADMIN tiene acceso a todo!
    }
    // ------------------------------------------

    // Verificar si el rol del usuario está incluido en los roles requeridos
    const hasRequiredRole = requiredRoles.includes(user.role_name);

    if (!hasRequiredRole) {
      this.logger.warn(
        `RolesGuard: Acceso denegado. El rol del usuario "${
          user.role_name
        }" no está autorizado para esta ruta. Roles permitidos: [${requiredRoles.join(
          ', ',
        )}].`,
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud. (Rol insuficiente)',
      );
    }

    this.logger.debug(
      `RolesGuard: Acceso concedido. El usuario tiene el rol requerido "${user.role_name}".`,
    );
    return true;
  }
}
