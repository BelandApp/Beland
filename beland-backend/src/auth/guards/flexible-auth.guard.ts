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
        'Attempting authentication with JwtAuthGuard (Auth0)...',
      );
      const auth0Result = await this.jwtAuthGuard.canActivate(context);
      if (auth0Result) {
        this.logger.debug(
          'Authentication successful with JwtAuthGuard (Auth0).',
        );
        return true;
      }
    } catch (auth0Error) {
      if (auth0Error instanceof UnauthorizedException) {
        this.logger.debug(
          `JwtAuthGuard failed: ${(auth0Error as Error).message}. Attempting with AuthenticationGuard (local)...`,
        );
        try {
          const localResult = await this.localAuthGuard.canActivate(context);
          if (localResult) {
            this.logger.debug(
              'Authentication successful with AuthenticationGuard (local).',
            );
            return true;
          }
        } catch (localError) {
          this.logger.warn(
            `AuthenticationGuard also failed: ${(localError as Error).message}`,
          );
          throw localError;
        }
      } else {
        this.logger.error(
          `Unexpected error from JwtAuthGuard: ${(auth0Error as Error).message}`,
          (auth0Error as Error).stack,
        );
        throw auth0Error;
      }
    }
    this.logger.warn(
      'Neither JwtAuthGuard nor AuthenticationGuard succeeded. Access denied.',
    );
    throw new UnauthorizedException(
      'Authentication failed: No valid token found.',
    );
  }
}
