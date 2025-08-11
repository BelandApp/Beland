import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('No autorizado. Token no proporcionado.');
    }

    try {
      const payload = this.jwtService.verify<User>(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = payload; // aquí se guarda el usuario
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido.');
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    // Si quisieras soportar cookies HTTP-only
    // return request.cookies?.['auth_token'] ?? null;
    return null;
  }
}
