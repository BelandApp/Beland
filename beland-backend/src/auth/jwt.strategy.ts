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
import { User } from 'src/users/entities/users.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Request } from 'express'; // Importar Request de express

interface Auth0Payload {
  sub: string;
  email?: string;
  name?: string;
  nickname?: string;
  email_verified?: boolean;
  picture?: string;
  exp?: number;
  [key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    const auth0Domain = configService.get<string>('AUTH0_DOMAIN');
    const auth0Audience = configService.get<string>('AUTH0_AUDIENCE');
    const auth0Namespace = configService.get<string>('AUTH0_NAMESPACE');

    if (!auth0Domain) {
      throw new InternalServerErrorException(
        'AUTH0_DOMAIN no está configurado en las variables de entorno. Por favor, revísalo.',
      );
    }

    // Llama a super() antes de cualquier uso de 'this'
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: auth0Audience,
      issuer: `https://${auth0Domain}/`,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
      }),
      passReqToCallback: true,
    });

    // Ahora puedes usar 'this'
    this.logger.debug(
      `[JwtStrategy Init] Raw AUTH0_DOMAIN: ${configService.get<string>(
        'AUTH0_DOMAIN',
      )}`,
    );
    this.logger.debug(
      `[JwtStrategy Init] Raw AUTH0_AUDIENCE: ${configService.get<string>(
        'AUTH0_AUDIENCE',
      )}`,
    );
    this.logger.debug(
      `[JwtStrategy Init] Raw AUTH0_NAMESPACE: ${configService.get<string>(
        'AUTH0_NAMESPACE',
      )}`,
    );

    if (!auth0Audience) {
      this.logger.warn(
        'AUTH0_AUDIENCE no está configurado. La validación de la audiencia puede fallar. Asegúrate de que tu .env tenga AUTH0_AUDIENCE.',
      );
    }
    this.logger.debug(
      `[JwtStrategy Init] Configured AUTH0_DOMAIN: ${auth0Domain}`,
    );
    this.logger.debug(
      `[JwtStrategy Init] Configured AUTH0_AUDIENCE: ${auth0Audience}`,
    );
    this.logger.debug(
      `[JwtStrategy Init] Configured AUTH0_NAMESPACE: ${
        auth0Namespace || 'No definido'
      }`,
    );
    this.logger.debug(
      `[JwtStrategy Init] Expected Issuer URI: https://${auth0Domain}/`,
    );
    this.logger.debug(
      `[JwtStrategy Init] JWKS URI for fetching public keys: https://${auth0Domain}/.well-known/jwks.json`,
    );
  }

  async validate(req: Request, payload: Auth0Payload): Promise<User> {
    this.logger.debug(
      '--- JwtStrategy: Iniciando validación de JWT (Auth0) ---',
    );
    this.logger.debug(
      `JwtStrategy: Payload decodificado: ${JSON.stringify(payload)}`,
    );

    const auth0_id = payload.sub;
    const namespace = this.configService.get<string>('AUTH0_NAMESPACE');

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

    this.logger.debug(`JwtStrategy: Extracted email: ${email}`);
    this.logger.debug(`JwtStrategy: Extracted full_name (name): ${name}`);
    this.logger.debug(
      `JwtStrategy: Extracted profile_picture_url (picture): ${picture}`,
    );
    this.logger.debug(
      `JwtStrategy: Extracted email_verified: ${emailVerified}`,
    );

    if (!auth0_id) {
      this.logger.error(
        'JwtStrategy: User ID (sub) no encontrado en el payload del token de Auth0. Acceso denegado.',
      );
      throw new UnauthorizedException('User ID not found in token payload.');
    }
    this.logger.debug(
      `JwtStrategy: Auth0 ID extraído (payload.sub): ${auth0_id}`,
    );

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
        'JwtStrategy: El payload del token de Auth0 no contiene un campo "exp". No se puede verificar la expiración del token.',
      );
    }

    const createUserDto: CreateUserDto = {
      oauth_provider: 'auth0',
      email: email || `${auth0_id.split('|')[1]}@auth0.temp.com`,
      username: payload.nickname || auth0_id.split('|')[1],
      full_name: name || 'Usuario Auth0',
      profile_picture_url: picture || null,
      password: 'temp_password_for_auth0_user',
      confirmPassword: 'temp_password_for_auth0_user',
      address: 'Dirección pendiente',
      // Asegúrate de que phone sea string si en CreateUserDto lo esperas como string
      phone: 0, // Si tu DTO espera un number, mantenlo, si no, ajusta
      country: 'País pendiente',
      city: 'Ciudad pendiente',
      isBlocked: false,
      deleted_at: null,
      auth0_id: auth0_id,
    };

    let user: User;
    try {
      user = await this.usersService.findOrCreateAuth0User(createUserDto);
      this.logger.debug(
        `JwtStrategy: findOrCreateAuth0User successful for ID: ${user.id}`,
      );
    } catch (error: unknown) {
      // Añadido : unknown
      this.logger.error(
        `JwtStrategy: Error en usersService.findOrCreateAuth0User para Auth0 ID "${auth0_id}": ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al provisionar o recuperar el usuario de la base de datos.',
      );
    }

    if (!user) {
      this.logger.error(
        `JwtStrategy: Falló la creación o recuperación del usuario con Auth0 ID "${auth0_id}".`,
      );
      throw new InternalServerErrorException(
        'Failed to provision or retrieve user from database. (Database sync issue)',
      );
    }

    // *** LÓGICA: Crear Wallet y Cart si no existen ***
    const queryRunner = this.authService.dataSource.createQueryRunner(); // Acceder a DataSource a través de AuthService
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hasWallet = await queryRunner.manager
        .getRepository(Wallet)
        .count({ where: { user: { id: user.id } } });
      const hasCart = await queryRunner.manager
        .getRepository(Cart)
        .count({ where: { user: { id: user.id } } });

      if (hasWallet === 0 || hasCart === 0) {
        this.logger.log(
          `JwtStrategy: Usuario Auth0 ID: ${user.id} no tiene Wallet/Cart. Creándolos...`,
        );
        await this.authService.createWalletAndCart(queryRunner, user);
        this.logger.log(
          `JwtStrategy: Wallet y Cart creados para usuario Auth0 ID: ${user.id}.`,
        );
      } else {
        this.logger.debug(
          `JwtStrategy: Usuario Auth0 ID: ${user.id} ya tiene Wallet y Cart.`,
        );
      }
      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      // Añadido : unknown
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `JwtStrategy: Error al crear Wallet/Cart para usuario Auth0 ID: ${
          user.id
        }: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al crear Wallet/Cart para usuario Auth0.',
      );
    } finally {
      await queryRunner.release();
    }
    // *** FIN LÓGICA ***

    this.logger.debug(
      `JwtStrategy: Usuario procesado en la DB: ${user.email} (ID: ${user.id}, Auth0 ID: ${user.auth0_id})`,
    );

    if (user.deleted_at) {
      this.logger.warn(
        `JwtStrategy: Cuenta de usuario "${user.email}" desactivada. Acceso denegado.`,
      );
      throw new UnauthorizedException('Your account is deactivated.');
    }

    if (user.isBlocked) {
      this.logger.warn(
        `JwtStrategy: Cuenta de usuario "${user.email}" bloqueada. Acceso denegado.`,
      );
      throw new UnauthorizedException('Your account has been blocked.');
    }

    this.logger.debug(
      'JwtStrategy: Validación de JWT exitosa. Usuario activo y autorizado.',
    );
    return user;
  }
}
