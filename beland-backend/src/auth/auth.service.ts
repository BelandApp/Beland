import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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


  // provisorio para presentacion

  async signup(user: RegisterAuthDto): Promise<{ token: string }> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userDB = await this.userRepository.getUserByEmail(user.email);
      if (userDB) {
        throw new UnauthorizedException(
          `Ya existe un usuario registrado con este email, prueba con "Olvide mi contraseña"`,
        );
      }

      const userRole: Role = await this.roleRepository.findByName('USER');
      if (!userRole) {
        throw new ConflictException('No se pudo obtener el rol USER');
      }

      const HashPassword = await bcrypt.hash(user.password, 10);

      // ✅ Crear usuario usando el manager de la transacción
      const userSave = await queryRunner.manager
        .getRepository(User)
        .save({
          name: user.name,
          email: user.email,
          role_id: userRole.role_id,
          password: HashPassword,
        });

      const usernamePart = user.email.split('@')[0];
      const randomNumber = Math.floor(Math.random() * 1000);
      const alias = `${usernamePart}.${randomNumber}`;
      const qr = await QRCode.toDataURL(alias);

      // ✅ Crear wallet usando el mismo manager
      const wallet = await queryRunner.manager
        .getRepository(Wallet)
        .save({
          alias,
          qr,
          user_id: userSave.id,
        });
      
      if (!wallet) throw new ConflictException('Error al crear la billetera. Intente registrarse Nuevamente'); 

      // ✅ Crear carrito usando el mismo manager
      const cart = await queryRunner.manager
        .getRepository(Cart)
        .save({
          user_id: userSave.id,
        });
      

      await queryRunner.commitTransaction(); // ✅ Confirma todo

      const userSavePayload = await this.userRepository.getUserById(userSave.id)
      
      //Crea el Token con todos los datos de usuario
      return await this.createToken(userSavePayload);
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 🔄 Reversión total
      throw new InternalServerErrorException('No se pudo registrar el usuario');
    } finally {
      await queryRunner.release();
    }
  }


  async signin(userLogin: LoginAuthDto): Promise<{ token: string }> {
    // comprueba que el usuario exista, sino devuelve un error
    const userDB: User = await this.userRepository.getUserByEmail(userLogin.email);
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

  async createToken (user:User): Promise<{ token: string }> {
    const userPayload = {
        ...user
      };
    const token = this.jwtService.sign(userPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

    
    return { token };
  }
}
