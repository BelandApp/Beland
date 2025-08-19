import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
  Logger, // Añadir Logger
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name); // Instancia del logger

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const baseActivation = await super.canActivate(context); // Llama al método canActivate de la clase padre
    if (!baseActivation) {
      this.logger.warn('JwtAuthGuard: Activación base de Passport fallida.');
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const dbUser: User = request.user; // El usuario ya debería haber sido adjuntado por JwtStrategy

    if (!dbUser) {
      this.logger.warn(
        'JwtAuthGuard: Usuario no encontrado en la base de datos después de la autenticación del token. Posible desincronización.',
      );
      throw new UnauthorizedException(
        'Estado de la cuenta de usuario inválido.',
      );
    }

    if (dbUser.deleted_at) {
      this.logger.warn(
        `JwtAuthGuard: Acceso denegado. Cuenta del usuario ID: ${dbUser.id} ha sido desactivada lógicamente.`,
      );
      throw new UnauthorizedException(
        'La cuenta de usuario ha sido desactivada.',
      );
    }

    if (dbUser.isBlocked) {
      this.logger.warn(
        `JwtAuthGuard: Acceso denegado. Cuenta del usuario ID: ${dbUser.id} ha sido bloqueada.`,
      );
      throw new UnauthorizedException(
        'La cuenta de usuario ha sido bloqueada.',
      );
    }

    this.logger.debug(
      `JwtAuthGuard: Autenticación exitosa para el usuario ID: ${dbUser.id}`,
    );
    return true;
  }

  // Maneja el resultado de la estrategia de Passport
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(
        `JwtAuthGuard: Fallo en la autenticación JWT. Error: ${
          err?.message || info?.message || 'Desconocido'
        }`,
      );
      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'Fallo en la autenticación JWT.',
        )
      );
    }
    return user;
  }
}
