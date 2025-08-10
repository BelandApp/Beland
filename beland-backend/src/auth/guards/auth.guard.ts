import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];
    if (!authorizationHeader) {
      throw new HttpException(
      { status: 401, error: 'No autorizado. Token no proporcionado.' },
        401,
      );
    }
    // El token estará en el formato "Bearer <token>"
    const parts = authorizationHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new HttpException(
        { status: 401, error: 'No autorizado. Token no proporcionado.' },
        401,
      );
    }
    const token = parts[1];

    if (!token) {
      // Si no encontramos el token ni en cookies ni en headers, lanzamos un error
      throw new HttpException(
        { status: 401, error: 'No autorizado. Token no proporcionado.' },
        401,
      );
    }

    try {
      const secret = process.env.JWT_SECRET;
      const payload = this.jwtService.verify(token, { secret });
      payload.iat = new Date(payload.iat * 1000);
      payload.exp = new Date(payload.exp * 1000);
      request.user = payload;
      return true;
    } catch (err) {
      throw new HttpException({ status: 401, error: `Token Invalido` }, 401);
    }
  }
}
