import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwksRsa from 'jwks-rsa';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/users.entity'; // Importar la entidad User
import { CreateUserDto } from 'src/users/dto/create-user.dto';

interface Auth0Payload {
  sub: string;
  email?: string;
  name?: string;
  nickname?: string;
  email_verified?: boolean;
  picture?: string;
  exp?: number;
  [key: string]: any; // Permite propiedades adicionales, incluyendo claims personalizados
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado "Authorization: Bearer <token>"
      audience: configService.get<string>('AUTH0_AUDIENCE'), // Verifica el claim 'aud' (audiencia) del token
      issuer: `https://${configService.get<string>('AUTH0_DOMAIN')}/`, // Verifica el claim 'iss' (emisor) del token
      algorithms: ['RS256'], // Espera que el token esté firmado con RS256 (no encriptado)
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        // Provee las claves públicas de Auth0 para verificar la firma del token
        cache: true, // Almacena en caché las claves públicas
        rateLimit: true, // Limita las solicitudes de claves para evitar sobrecarga
        jwksRequestsPerMinute: 5, // Máximo 5 solicitudes JWKS por minuto
        jwksUri: `https://${configService.get<string>(
          'AUTH0_DOMAIN',
        )}/.well-known/jwks.json`, // URL para obtener las claves públicas de Auth0
      }),
      passReqToCallback: true, // Pasa el objeto Request a la función validate
    });
  }

  // Función de validación: Se ejecuta si el token es válido y su firma es verificada
  async validate(req: Request, payload: Auth0Payload): Promise<User> {
    this.logger.debug('--- JwtStrategy: Iniciando validación de JWT ---');
    this.logger.debug(
      `JwtStrategy: Payload decodificado: ${JSON.stringify(payload)}`,
    );

    const auth0_id = payload.sub; // 'sub' es el ID de usuario único en Auth0
    // Obtiene el namespace de las variables de entorno
    const namespace = this.configService.get<string>('AUTH0_NAMESPACE');

    // Extrae los claims personalizados usando el namespace, o usa los claims estándar como fallback
    const email = (namespace && payload[`${namespace}email`]) || payload.email;
    const name =
      (namespace && payload[`${namespace}name`]) ||
      payload.name ||
      payload.nickname;
    const emailVerified =
      (namespace && payload[`${namespace}email_verified`]) ||
      payload.email_verified;
    const picture =
      (namespace && payload[`${namespace}picture`]) || payload.picture;

    if (!auth0_id) {
      this.logger.error(
        'JwtStrategy: User ID (sub) no encontrado en el payload del token.',
      );
      throw new UnauthorizedException('User ID not found in token payload.');
    }
    this.logger.debug(`JwtStrategy: Auth0 ID extraído: ${auth0_id}`);

    // Loguea el tiempo de expiración del token para depuración
    if (payload.exp) {
      const expirationTime = new Date(payload.exp * 1000);
      const currentTime = new Date();
      const remainingTimeMs = expirationTime.getTime() - currentTime.getTime();
      const remainingMinutes = Math.floor(remainingTimeMs / (1000 * 60));
      const remainingSeconds = Math.floor(
        (remainingTimeMs % (1000 * 60)) / 1000,
      );

      this.logger.debug(
        `JwtStrategy: Token expira en: ${expirationTime.toISOString()}`,
      );
      this.logger.debug(
        `JwtStrategy: Tiempo restante del token: ${remainingMinutes} minutos y ${remainingSeconds} segundos.`,
      );
    } else {
      this.logger.warn(
        'JwtStrategy: El payload del token no contiene un campo "exp".',
      );
    }

    // Aquí construimos el DTO con todas las propiedades requeridas
    // Aseguramos que los campos obligatorios para CreateUserDto estén presentes.
    const createUserDto: CreateUserDto = {
      oauth_provider: 'auth0',
      email: email || `${auth0_id}@temp.com`, // Proporcionar un email por defecto si Auth0 no lo da
      full_name: name || 'Usuario Auth0',
      profile_picture_url: picture || '',
      password: 'temp_password_for_auth0_user', // Contraseña temporal para usuarios Auth0
      confirmPassword: 'temp_password_for_auth0_user', // Necesario para validación, aunque temporal
      address: 'Dirección pendiente',
      phone: 0,
      country: 'País pendiente',
      city: 'Ciudad pendiente',
      isBlocked: false, // Por defecto, el usuario no está bloqueado
      deleted_at: null, // Por defecto, el usuario no está desactivado
      username: payload.nickname || auth0_id, // Usar nickname o auth0_id como username
      // El campo 'role' se asignará por defecto en createInitialUser si no se especifica
      // o se puede extraer de un claim personalizado si se añadió en la acción de Auth0
      // role: (namespace && payload[`${namespace}role`]) || 'USER', // Ejemplo si tuvieras el claim de rol
    };

    // Llama al servicio de usuarios para crear o recuperar el usuario en tu base de datos
    const user = await this.usersService.createInitialUser(createUserDto);

    if (!user) {
      this.logger.error(
        `JwtStrategy: Falló la creación o recuperación del usuario con Auth0 ID "${auth0_id}".`,
      );
      throw new InternalServerErrorException(
        'Failed to provision or retrieve user from database.',
      );
    }
    this.logger.debug(
      `JwtStrategy: Usuario procesado en la DB: ${user.email} (ID: ${user.id})`,
    );

    // Verifica el estado del usuario en tu base de datos (desactivado o bloqueado)
    if (user.deleted_at) {
      this.logger.warn(
        `JwtStrategy: Cuenta de usuario "${user.email}" desactivada.`,
      );
      throw new UnauthorizedException('Your account is deactivated.');
    }

    if (user.isBlocked) {
      this.logger.warn(
        `JwtStrategy: Cuenta de usuario "${user.email}" bloqueada.`,
      );
      throw new UnauthorizedException('Your account has been blocked.');
    }

    this.logger.debug(
      'JwtStrategy: Validación de JWT exitosa. Usuario activo y autorizado.',
    );
    return user; // Retornar la entidad User para adjuntarla a la request (req.user)
  }
}
