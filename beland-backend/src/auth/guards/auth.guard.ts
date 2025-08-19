import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException, // Cambiado de HttpException a UnauthorizedException para consistencia
  HttpStatus,
  HttpException, // Se mantiene para el mensaje personalizado inicial
  Logger, // Añadir Logger para mensajes
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name); // Instancia del logger

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn(
        'AuthenticationGuard: Acceso denegado. Token no proporcionado.',
      );
      throw new UnauthorizedException({
        // Usar UnauthorizedException para mantener la semántica estándar
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'No autorizado. Token no proporcionado.',
        error: 'Unauthorized',
      });
    }

    try {
      const payload = this.jwtService.verify<User>(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = payload; // Adjuntar el payload del token al objeto de request
      this.logger.debug(
        `AuthenticationGuard: Token local verificado para el usuario ID: ${payload.id}`,
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `AuthenticationGuard: Token local inválido o expirado. Error: ${
          (error as Error).message
        }`,
      );
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'No autorizado. Token inválido o expirado.',
        error: 'Unauthorized',
      });
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return null;
  }
}
