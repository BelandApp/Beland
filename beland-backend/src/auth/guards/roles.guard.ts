// src/auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator'; // Importar la clave del decorador
import { User } from 'src/users/entities/users.entity'; // Importar la entidad User

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
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Asumimos que el JwtAuthGuard ya ha adjuntado el usuario completo (incluyendo role_name) a la request.
    // La propiedad 'user' en la request es el resultado de la validación del Passport Strategy.
    const user: User = request.user;

    this.logger.debug(`Roles requeridos: ${requiredRoles.join(', ')}`);
    this.logger.debug(`Rol del usuario: ${user ? user.role_name : 'N/A'}`);

    // Si no hay usuario o el usuario no tiene rol, denegar acceso
    if (!user || !user.role_name) {
      this.logger.warn('Acceso denegado: Usuario no autenticado o sin rol.');
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud.',
      );
    }

    // Verificar si el rol del usuario está incluido en los roles requeridos
    const hasRequiredRole = requiredRoles.includes(user.role_name);

    if (!hasRequiredRole) {
      this.logger.warn(
        `Acceso denegado: Rol del usuario "${user.role_name}" no autorizado para esta ruta.`,
      );
      throw new ForbiddenException(
        'No tienes los permisos necesarios para esta solicitud.',
      );
    }

    return true;
  }
}
