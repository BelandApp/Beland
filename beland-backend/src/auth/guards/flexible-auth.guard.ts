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
      // 🚀 Attempt to authenticate with the Auth0 JWT Guard first.
      // This guard will throw an UnauthorizedException if the token is invalid or missing.
      this.logger.debug(
        'Attempting authentication with JwtAuthGuard (Auth0)...',
      );
      const auth0Result = await this.jwtAuthGuard.canActivate(context);
      if (auth0Result) {
        this.logger.debug(
          'Authentication successful with JwtAuthGuard (Auth0).',
        );
        return true; // Auth0 authentication successful
      }
    } catch (auth0Error) {
      // ⚠️ If JwtAuthGuard fails with UnauthorizedException, it means the Auth0 token
      // was not valid or present. In this case, we proceed to try the local guard.
      if (auth0Error instanceof UnauthorizedException) {
        this.logger.debug(
          `JwtAuthGuard failed: ${auth0Error.message}. Attempting with AuthenticationGuard (local)...`,
        );
        try {
          // 🏠 Try to authenticate with the local AuthenticationGuard.
          const localResult = await this.localAuthGuard.canActivate(context);
          if (localResult) {
            this.logger.debug(
              'Authentication successful with AuthenticationGuard (local).',
            );
            return true; // Local authentication successful
          }
        } catch (localError) {
          // ❌ If both guards fail, rethrow the error from the local guard.
          this.logger.warn(
            `AuthenticationGuard also failed: ${(localError as Error).message}`,
          );
          throw localError; // Re-throw the local authentication error
        }
      } else {
        // 🚨 If it's a different type of error from JwtAuthGuard (e.g., unexpected server error),
        // we should rethrow it immediately.
        this.logger.error(
          `Unexpected error from JwtAuthGuard: ${(auth0Error as Error).message}`,
          (auth0Error as Error).stack,
        );
        throw auth0Error;
      }
    }
    // If neither guard successfully authenticates (e.g., if canActivate returns false without throwing)
    this.logger.warn(
      'Neither JwtAuthGuard nor AuthenticationGuard succeeded. Access denied.',
    );
    throw new UnauthorizedException(
      'Authentication failed: No valid token found.',
    );
  }
}
