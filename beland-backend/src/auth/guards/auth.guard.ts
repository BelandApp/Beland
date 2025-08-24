import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  HttpStatus,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

// Interfaz para el payload de tu token JWT local
// Esto asegura que TypeScript reconozca la propiedad 'sub'
interface LocalJwtPayload {
  sub: string; // ID del usuario (subject)
  email: string;
  role_name: string;
  full_name?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn(
        'AuthenticationGuard: Acceso denegado. Token no proporcionado.',
      );
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'No autorizado. Token no proporcionado.',
        error: 'Unauthorized',
      });
    }

    try {
      // Usar la nueva interfaz LocalJwtPayload para tipar el payload decodificado
      const payload = this.jwtService.verify<LocalJwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub; // Ahora 'sub' es reconocido en LocalJwtPayload
      if (!userId) {
        this.logger.error(
          'AuthenticationGuard: Payload del token JWT local no contiene "sub" (ID de usuario).',
        );
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'No autorizado. ID de usuario faltante en el token.',
          error: 'Unauthorized',
        });
      }

      // Usar el método correcto del UsersService para obtener la entidad User
      const user = await this.usersService.findUserEntityById(userId);

      if (!user) {
        this.logger.warn(
          `AuthenticationGuard: Usuario ID: ${userId} no encontrado en la base de datos o inactivo.`,
        );
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'No autorizado. Usuario no encontrado o inactivo.',
          error: 'Unauthorized',
        });
      }

      // Adjuntar el objeto User completo a la request
      request.user = user;

      this.logger.debug(
        `AuthenticationGuard: Token local verificado y usuario completo ID: ${user.id} adjuntado a la request.`,
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
