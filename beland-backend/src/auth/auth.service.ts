import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { LoginAuthDto } from './dto/login-auth.dto';
import { User } from 'src/users/entities/users.entity';
import { UsersRepository } from 'src/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { RolesRepository } from 'src/roles/roles.repository';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Cart } from 'src/cart/entities/cart.entity';
import { AuthVerification } from './entities/auth.entity';
import { EmailService } from 'src/email/email.service';
import { CreateEmailDto } from 'src/email/dto/create-email.dto';
import { verificationEmailTemplate } from 'src/email/plantilla/htmlVerificacion';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(AuthVerification)
    private readonly authVerificationRepository: Repository<AuthVerification>,
    private readonly userRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly emailService: EmailService,
    public dataSource: DataSource,
    @Inject(forwardRef(() => JwtStrategy))
    private readonly jwtAuth0Strategy: JwtStrategy,
  ) {}

  async createToken(userPayload: User): Promise<{ token: string }> {
    const payload = {
      sub: userPayload.id,
      email: userPayload.email,
      role_name: userPayload.role_name,
      full_name: userPayload.full_name,
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      this.logger.error(
        'JWT_SECRET no está configurado. No se puede firmar el token.',
      );
      throw new InternalServerErrorException(
        'Configuración de autenticación faltante.',
      );
    }
    const token = this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: '12h',
    });
    this.logger.log(
      `createToken(): Token JWT local generado para el usuario ID: ${userPayload.id}`,
    );
    return { token };
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{ token: string }> {
    const { email, password } = loginAuthDto;
    this.logger.debug(
      `login(): Intentando iniciar sesión para el email: ${email}`,
    );

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn(
        `login(): Intento fallido de login para email: ${email} - Usuario no encontrado.`,
      );
      throw new NotFoundException('Usuario o contraseña inválidos.');
    }

    if (user.deleted_at !== null) {
      this.logger.warn(
        `login(): Intento de login para usuario desactivado: ${email}.`,
      );
      throw new UnauthorizedException(
        'Tu cuenta ha sido desactivada. Contacta al soporte.',
      );
    }

    if (user.isBlocked) {
      this.logger.warn(
        `login(): Intento de login para usuario bloqueado: ${email}.`,
      );
      throw new UnauthorizedException(
        'Tu cuenta ha sido bloqueada. Contacta al soporte.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(
        `login(): Intento fallido de login para email: ${email} - Contraseña inválida.`,
      );
      throw new UnauthorizedException('Usuario o contraseña inválidos.');
    }

    this.logger.log(
      `login(): Inicio de sesión exitoso para el usuario ID: ${user.id}.`,
    );
    return this.createToken(user);
  }

  async signupVerification(
    userDto: RegisterAuthDto,
  ): Promise<{ message: string }> {
    this.logger.debug(
      `signupVerification(): Iniciando verificación de registro para el email: ${userDto.email}`,
    );

    const existingUser = await this.userRepository.findByEmail(userDto.email);
    if (existingUser) {
      this.logger.warn(
        `signupVerification(): Intento de registro con email ya existente: ${userDto.email}.`,
      );
      throw new ConflictException('Este email ya está registrado.');
    }

    const existingVerification =
      await this.authVerificationRepository.findOneBy({
        email: userDto.email,
        is_verified: false,
      });

    if (existingVerification) {
      this.logger.warn(
        `signupVerification(): Ya existe una verificación pendiente para el email: ${userDto.email}.`,
      );
      throw new ConflictException(
        'Ya existe una verificación pendiente para este email. Por favor, revisa tu bandeja de entrada o espera para solicitar una nueva.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const expiresAt = new Date(Date.now() + 3600 * 1000);

      const newAuthVerification = this.authVerificationRepository.create({
        email: userDto.email,
        code: verificationCode, // Coincide con 'code' en la entidad
        passwordHashed: hashedPassword, // Coincide con 'passwordHashed' en la entidad
        full_name: userDto.full_name,
        username: userDto.username,
        profile_picture_url: userDto.profile_picture_url,
        address: userDto.address,
        phone: userDto.phone, // Ya es number en RegisterAuthDto y AuthVerification
        country: userDto.country,
        city: userDto.city,
        is_verified: false,
        expires_at: expiresAt,
        // role_id y role_name no se establecen aquí, se asignan al User final.
        // Si tu DB requiere que estén presentes, asegúrate de que sean NULLABLE en la DB.
      });

      await queryRunner.manager.save(newAuthVerification);

      const emailContent = verificationEmailTemplate(
        userDto.full_name || userDto.email,
        verificationCode,
      );
      await this.emailService.sendMail({
        to: userDto.email,
        subject: 'Código de Verificación para Beland',
        html: emailContent,
        text: `Tu código de verificación para Beland es: ${verificationCode}. Este código expira en 1 hora.`, // Añadido campo 'text'
      });

      await queryRunner.commitTransaction();
      this.logger.log(
        `signupVerification(): Email de verificación enviado a ${userDto.email}.`,
      );
      return { message: 'Código de verificación enviado a su email.' };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `signupVerification(): Error durante la verificación de registro para ${
          userDto.email
        }: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al iniciar el proceso de registro.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async signupRegister(
    code: string,
    email: string,
  ): Promise<{ token: string }> {
    this.logger.debug(
      `signupRegister(): Intentando registrar usuario para el email: ${email} con código: ${code}`,
    );

    const verificationEntry = await this.authVerificationRepository.findOneBy({
      email,
      code, // Coincide con 'code' en la entidad
      is_verified: false,
    });

    if (!verificationEntry) {
      this.logger.warn(
        `signupRegister(): Verificación fallida para email: ${email} - Código inválido o expirado.`,
      );
      throw new BadRequestException(
        'Código de verificación inválido o expirado.',
      );
    }

    if (
      verificationEntry.expires_at &&
      verificationEntry.expires_at < new Date()
    ) {
      // Acceso seguro a expires_at
      this.logger.warn(
        `signupRegister(): Verificación fallida para email: ${email} - Código expirado.`,
      );
      throw new BadRequestException('El código de verificación ha expirado.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      verificationEntry.is_verified = true;
      await queryRunner.manager.save(verificationEntry);

      const defaultRole = await this.rolesRepository.findByName('USER');
      if (!defaultRole) {
        this.logger.error(
          'signupRegister(): Rol "USER" no encontrado. Asegúrate de que los roles por defecto estén inicializados.',
        );
        throw new InternalServerErrorException(
          'Error en la configuración del sistema de roles.',
        );
      }

      const newUser = queryRunner.manager.create(User, {
        email: verificationEntry.email,
        password: verificationEntry.passwordHashed, // Usar 'passwordHashed' de la entidad
        full_name: verificationEntry.full_name,
        username: verificationEntry.username,
        profile_picture_url: verificationEntry.profile_picture_url,
        address: verificationEntry.address,
        phone: verificationEntry.phone, // Ya es number y coincide con User
        country: verificationEntry.country,
        city: verificationEntry.city,
        role_relation: defaultRole,
        role_name: defaultRole.name,
        isBlocked: false,
        deleted_at: null,
      });

      const userSavePayload = await queryRunner.manager.save(newUser);
      this.logger.debug(
        `signupRegister(): Usuario ${userSavePayload.email} creado con ID: ${userSavePayload.id}`,
      );

      await this.createWalletAndCart(queryRunner, userSavePayload);
      this.logger.debug(
        `signupRegister(): Wallet y Cart creados para el nuevo usuario ID: ${userSavePayload.id}`,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        `signupRegister(): Usuario ${userSavePayload.email} registrado exitosamente.`,
      );

      if (!userSavePayload) {
        throw new InternalServerErrorException(
          'Error al recuperar el usuario registrado.',
        );
      }

      return await this.createToken(userSavePayload);
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `signupRegister(): Error durante el registro de usuario para ${email}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'No se pudo registrar el usuario debido a un error interno.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async forgotPassword(email: string): Promise<{ token: string }> {
    this.logger.debug(
      `forgotPassword(): Solicitud para recuperar contraseña para el email: ${email}`,
    );
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(
        `forgotPassword(): Email ${email} no encontrado para recuperación de contraseña.`,
      );
      throw new NotFoundException(
        'Todavia no es usuario. Debe registrarse primero',
      );
    }
    const userPayload = {
      user_id: user.id,
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      this.logger.error(
        'JWT_SECRET no está configurado para forgotPassword. No se puede firmar el token.',
      );
      throw new InternalServerErrorException(
        'Configuración de autenticación faltante.',
      );
    }
    const token = this.jwtService.sign(userPayload, {
      secret: secret,
      expiresIn: '1h',
    });
    this.logger.log(
      `forgotPassword(): Token de recuperación generado para el usuario ID: ${user.id}.`,
    );
    return { token };
  }

  async createWalletAndCart(
    queryRunner: QueryRunner,
    user: User,
  ): Promise<void> {
    this.logger.debug(
      `createWalletAndCart(): Creando Wallet y Cart para el usuario ID: ${user.id}`,
    );
    try {
      const newWallet = queryRunner.manager.create(Wallet, {
        user: user,
        balance: 0,
      });
      await queryRunner.manager.save(newWallet);
      this.logger.debug(
        `createWalletAndCart(): Wallet creada para el usuario ID: ${user.id}`,
      );

      const newCart = queryRunner.manager.create(Cart, { user: user });
      await queryRunner.manager.save(newCart);
      this.logger.debug(
        `createWalletAndCart(): Cart creado para el usuario ID: ${user.id}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `createWalletAndCart(): Error al crear Wallet/Cart para el usuario ID: ${
          user.id
        }: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al crear la cartera o el carrito del usuario.',
      );
    }
  }

  async exchangeAuth0TokenForLocalToken(
    auth0Token: string,
  ): Promise<{ token: string }> {
    this.logger.debug(
      'exchangeAuth0TokenForLocalToken(): Iniciando intercambio de token de Auth0 por token local.',
    );

    try {
      const decodedPayload = this.jwtService.decode(auth0Token);

      if (!decodedPayload) {
        this.logger.warn(
          'exchangeAuth0TokenForLocalToken(): No se pudo decodificar el token de Auth0. Posiblemente inválido o mal formado.',
        );
        throw new UnauthorizedException(
          'Token de Auth0 inválido o mal formado.',
        );
      }
      this.logger.debug(
        `exchangeAuth0TokenForLocalToken(): Payload decodificado del token de Auth0: ${JSON.stringify(
          decodedPayload,
        )}`,
      );

      const mockRequest: Partial<Request> = {
        headers: {
          authorization: `Bearer ${auth0Token}`,
        } as Record<string, string>,
      };

      const user = await this.jwtAuth0Strategy.validate(
        mockRequest as Request,
        decodedPayload as any,
      );

      if (!user) {
        this.logger.error(
          'exchangeAuth0TokenForLocalToken(): JwtStrategy no devolvió un usuario válido después de la validación del token de Auth0.',
        );
        throw new InternalServerErrorException(
          'Fallo al obtener la información del usuario de Auth0.',
        );
      }

      this.logger.log(
        `exchangeAuth0TokenForLocalToken(): Usuario Auth0 ${user.email} (ID: ${user.id}) autenticado/registrado exitosamente. Generando token local.`,
      );

      return this.createToken(user);
    } catch (error: unknown) {
      this.logger.error(
        `exchangeAuth0TokenForLocalToken(): Error durante el intercambio de token de Auth0: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Fallo al intercambiar el token de Auth0 debido a un error interno.',
      );
    }
  }
}
