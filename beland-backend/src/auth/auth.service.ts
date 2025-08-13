// src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
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
import { DataSource } from 'typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Cart } from 'src/cart/entities/cart.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userRepository: UsersRepository,
    private readonly roleRepository: RolesRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  // Puedes implementar este método si necesitas obtener token de Management API de Auth0
  async getManagementApiToken(): Promise<string> {
    try {
      const auth0Domain = this.configService.get<string>('AUTH0_DOMAIN');
      const auth0ManagementClientId = this.configService.get<string>(
        'AUTH0_MANAGEMENT_CLIENT_ID',
      );
      const auth0ManagementClientSecret = this.configService.get<string>(
        'AUTH0_MANAGEMENT_CLIENT_SECRET',
      );
      const auth0ManagementAudience = `${auth0Domain}api/v2/`;

      const response = await this.httpService
        .post(`${auth0Domain}oauth/token`, {
          client_id: auth0ManagementClientId,
          client_secret: auth0ManagementClientSecret,
          audience: auth0ManagementAudience,
          grant_type: 'client_credentials',
        })
        .toPromise();

      return response.data.access_token;
    } catch (error: any) {
      console.error(
        'Error getting Auth0 Management API token:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to get Auth0 Management API token.',
      );
    }
  }

  async signup(user: RegisterAuthDto): Promise<{ token: string }> {
    
    // ✅ VALIDACIÓN: Comparar password y confirmPassword here
      if (user.password !== user.confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden.');
      }
    
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const userDB = await this.userRepository.findByEmail(user.email);
      if (userDB) {
        throw new ConflictException( // Changed to ConflictException as it's more semantically correct for existing resource
          `Ya existe un usuario registrado con este email, prueba con "Olvide mi contraseña"`,
        );
      }

      const userRole: Role = await this.roleRepository.findByName('USER');
      if (!userRole) {
        throw new InternalServerErrorException(
          'No se pudo obtener el rol USER. Asegúrate de que el rol "USER" exista en la base de datos.',
        );
      }

      const HashPassword = await bcrypt.hash(user.password, 10);

      // ✅ Crear usuario usando el manager de la transacción
      const userSave = await queryRunner.manager.getRepository(User).save({
        full_name: user.full_name || null, // Ensure nullable fields can be null
        email: user.email,
        username: user.username || null, // Ensure nullable fields can be null
        profile_picture_url: user.profile_picture_url || null, // Ensure nullable fields can be null
        address: user.address,
        phone: user.phone,
        country: user.country,
        city: user.city,
        isBlocked: false, // Por defecto, no bloqueado
        deleted_at: null, // Por defecto, no eliminado
        role_id: userRole.role_id,
        role_name: userRole.name as any,
        password: HashPassword,
      });

      const usernamePart = user.email.split('@')[0];
      const randomNumber = Math.floor(Math.random() * 1000);
      const alias = `${usernamePart}.${randomNumber}`;

      const walletRepo = this.dataSource.getRepository(Wallet);

      // 1️⃣ Crear y guardar la wallet con user_id y alias
      const savedWallet = await queryRunner.manager.getRepository(Wallet).save({
        user_id: userSave.id,
        alias
      });

      // 2️⃣ Generar el QR con el ID ya guardado
      const qr = await QRCode.toDataURL(savedWallet.id);

      // 3️⃣ Actualizar la wallet con el QR
      savedWallet.qr = qr;
      await queryRunner.manager.getRepository(Wallet).save(savedWallet);

      if (!savedWallet)
        throw new InternalServerErrorException(
          'Error al crear la billetera. Intente registrarse Nuevamente',
        );

      // ✅ Crear carrito usando el mismo manager
      const cart = await queryRunner.manager.getRepository(Cart).save({
        user_id: userSave.id,
      });

      await queryRunner.commitTransaction(); // ✅ Confirma todo


      const userSavePayload = await this.userRepository.findOne(userSave.id);

      // Asegurarse de que userSavePayload no sea null antes de usarlo
      if (!userSavePayload) {
        throw new InternalServerErrorException(
          'Error al recuperar el usuario registrado.',
        );
      }

      //Crea el Token con todos los datos de usuario
      return await this.createToken(userSavePayload);
    } catch (error: any) {
      await queryRunner.rollbackTransaction(); // 🔄 Reversión total

      if (
        error instanceof UnauthorizedException || // Keeping this although ConflictException is more precise now
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error; // Re-lanza excepciones específicas
      }
      // Log the unexpected error before throwing a generic one
      console.error('Error durante el registro de usuario:', error);
      throw new InternalServerErrorException(
        'No se pudo registrar el usuario debido a un error interno.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async signin(userLogin: LoginAuthDto): Promise<{ token: string }> {
    // comprueba que el usuario exista, sino devuelve un error
    const userDB: User = await this.userRepository.findByEmail(userLogin.email);
    if (!userDB) {
      throw new BadRequestException('Usuario o Clave incorrectos');
    }
    // comprueba que la clave sea correcta, sino devuelve un error
    const isPasswordValid = await bcrypt.compare(
      userLogin.password,
      userDB.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Usuario o Clave incorrectos');
    }

    //Crea el Token con todos los datos de usuario
    return await this.createToken(userDB);
  }

  async createToken(user: User): Promise<{ token: string }> {
    const userPayload = {
      id: user.id,
      email: user.email,

      username: user.username,
      full_name: user.full_name,
      profile_picture_url: user.profile_picture_url,
      role_name: user.role_name,
      role_id: user.role_id,
      isBlocked: user.isBlocked,
      deleted_at: user.deleted_at,
      oauth_provider: user.oauth_provider,
      auth0_id: user.auth0_id,
    };
    const token = this.jwtService.sign(userPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h', // Tiempo de expiración para tokens locales (se usa en JwtModule también)
    });


    return { token };
  }
}
