// src/auth/guards/flexible-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthenticationGuard } from './auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  private readonly logger = new Logger(FlexibleAuthGuard.name);

  constructor(
    private readonly localAuthGuard: AuthenticationGuard,
    private readonly jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      this.logger.debug(
        'FlexibleAuthGuard: Intentando autenticación con JwtAuthGuard (Auth0)...',
      );
      const auth0Result = await this.jwtAuthGuard.canActivate(context);
      if (auth0Result) {
        this.logger.debug(
          'FlexibleAuthGuard: Autenticación exitosa con JwtAuthGuard (Auth0).',
        );
        return true;
      }
    } catch (auth0Error) {
      if (auth0Error instanceof UnauthorizedException) {
        this.logger.debug(
          `FlexibleAuthGuard: JwtAuthGuard falló: ${
            (auth0Error as Error).message
          }. Intentando con AuthenticationGuard (local)...`,
        );
        try {
          const localResult = await this.localAuthGuard.canActivate(context);
          if (localResult) {
            this.logger.debug(
              'FlexibleAuthGuard: Autenticación exitosa con AuthenticationGuard (local).',
            );
            return true;
          }
        } catch (localError) {
          this.logger.warn(
            `FlexibleAuthGuard: AuthenticationGuard también falló: ${
              (localError as Error).message
            }`,
          );
          // Si ambos fallan con Unauthorized, el último error es el que se propaga.
          throw localError;
        }
      } else {
        // Errores inesperados de JwtAuthGuard (ej. de configuración de Auth0, red)
        this.logger.error(
          `FlexibleAuthGuard: Error inesperado de JwtAuthGuard: ${
            (auth0Error as Error).message
          }`,
          (auth0Error as Error).stack,
        );
        throw auth0Error; // Propaga el error inesperado
      }
    }

    this.logger.warn(
      'FlexibleAuthGuard: Ni JwtAuthGuard ni AuthenticationGuard tuvieron éxito. Acceso denegado.',
    );
    throw new UnauthorizedException(
      'Fallo en la autenticación: No se encontró un token válido.',
    );
  }
}
