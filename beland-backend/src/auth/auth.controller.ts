import {
  Controller,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { User } from 'src/users/entities/users.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthService } from './auth.service';
import { ConfirmAuthDto, RegisterAuthDto } from './dto/register-auth.dto';
import { Request } from 'express';
import { FlexibleAuthGuard } from './guards/flexible-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @UseGuards(FlexibleAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Retorna datos del usuario logueado. Requiere token JWT válido.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Token válido. Retorna información del usuario.',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado o usuario bloqueado/desactivado.',
  })
  getProfile(@Req() req: Request): Omit<User, 'password'> {
    this.logger.log(
      `GET /auth/me: Solicitud de perfil para usuario ID: ${
        (req.user as User)?.id
      }`,
    );
    const { password, ...userReturn } = req.user;
    return userReturn;
  }

  @Post('signup')
  @ApiOperation({ summary: 'Registra usuarios nuevos' })
  @ApiBody({
    description:
      'Ingrese todos los datos requeridos para el registro de usuario',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'usuario@example.com',
          description: 'Correo electrónico del usuario',
        },
        password: {
          type: 'string',
          example: 'StrongPass123!',
          description:
            'Contraseña del usuario (mínimo 8 caracteres, mayúscula, minúscula, número, símbolo)',
        },
        confirmPassword: {
          type: 'string',
          example: 'StrongPass123!',
          description:
            'Confirmación de la contraseña (debe coincidir con la contraseña)',
        },
        address: {
          type: 'string',
          example: 'Calle Falsa 123',
          description: 'Dirección física del usuario',
        },
        phone: {
          type: 'number',
          example: 1234567890,
          description: 'Número de teléfono del usuario',
        },
        country: {
          type: 'string',
          example: 'Colombia',
          description: 'País del usuario',
        },
        city: {
          type: 'string',
          example: 'Bogotá',
          description: 'Ciudad del usuario',
        },
        username: {
          type: 'string',
          example: 'johndoe',
          description: 'Nombre de usuario (opcional)',
          nullable: true,
        },
        full_name: {
          type: 'string',
          example: 'John Doe',
          description: 'Nombre completo del usuario (opcional)',
          nullable: true,
        },
        profile_picture_url: {
          type: 'string',
          format: 'url',
          example: 'https://example.com/photo.jpg',
          description: 'URL de la imagen de perfil (opcional)',
          nullable: true,
        },
      },
      required: [
        'email',
        'password',
        'confirmPassword',
        'address',
        'phone',
        'country',
        'city',
      ],
    },
  })
  async signup(@Body() user: RegisterAuthDto): Promise<{ token: string }> {
    this.logger.log(
      `POST /auth/signup: Solicitud de registro para email: ${user.email}`,
    );
    return await this.authService.signup(user);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Realiza el Login de usuarios' })
  @ApiBody({ description: 'Las credenciales', type: LoginAuthDto })
  async signin(@Body() userLogin: LoginAuthDto): Promise<{ token: string }> {
    this.logger.log(
      `POST /auth/signin: Solicitud de inicio de sesión para email: ${userLogin.email}`,
    );
    return await this.authService.signin(userLogin);
  }

  @Post('signup-verification')
  @ApiOperation({ summary: 'Envia la Verificaicon de email con el codigo' })
  @ApiBody({
    description:
      'Ingrese todos los datos requeridos para el registro de usuario',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'usuario@example.com',
          description: 'Correo electrónico del usuario',
        },
        password: {
          type: 'string',
          example: 'StrongPass123!',
          description:
            'Contraseña del usuario (mínimo 8 caracteres, mayúscula, minúscula, número, símbolo)',
        },
        confirmPassword: {
          type: 'string',
          example: 'StrongPass123!',
          description:
            'Confirmación de la contraseña (debe coincidir con la contraseña)',
        },
        address: {
          type: 'string',
          example: 'Calle Falsa 123',
          description: 'Dirección física del usuario',
        },
        phone: {
          type: 'number',
          example: 1234567890,
          description: 'Número de teléfono del usuario',
        },
        country: {
          type: 'string',
          example: 'Colombia',
          description: 'País del usuario',
        },
        city: {
          type: 'string',
          example: 'Bogotá',
          description: 'Ciudad del usuario',
        },
        username: {
          type: 'string',
          example: 'johndoe',
          description: 'Nombre de usuario (opcional)',
          nullable: true,
        },
        full_name: {
          type: 'string',
          example: 'John Doe',
          description: 'Nombre completo del usuario (opcional)',
          nullable: true,
        },
        profile_picture_url: {
          type: 'string',
          format: 'url',
          example: 'https://example.com/photo.jpg',
          description: 'URL de la imagen de perfil (opcional)',
          nullable: true,
        },
      },
      required: [
        'email',
        'password',
        'confirmPassword',
        'address',
        'phone',
        'country',
        'city',
      ],
    },
  })
  async signupVerification(
    @Body() user: RegisterAuthDto,
  ): Promise<{ message: string }> {
    this.logger.log(
      `POST /auth/signup-verification: Solicitud de verificación para email: ${user.email}`,
    );
    return await this.authService.signupVerification(user);
  }

  @Post('signup-register')
  @ApiOperation({ summary: 'Realiza el registro de usuarios' })
  @ApiBody({
    description: 'Email y codigo de confirmación',
    type: ConfirmAuthDto,
  })
  async signupRegister(
    @Body() verification: ConfirmAuthDto,
  ): Promise<{ token: string }> {
    this.logger.log(
      `POST /auth/signup-register: Solicitud de registro final para email: ${verification.email}`,
    );
    return await this.authService.signupRegister(
      verification.code,
      verification.email,
    );
  }

  @Post('forgot-password/:email')
  @ApiOperation({ summary: 'Realiza el registro de usuarios' })
  @ApiParam({ name: 'email', description: 'UUID de la fundación' })
  async forgotPassword(
    @Param('email') email: string,
  ): Promise<{ token: string }> {
    this.logger.log(
      `POST /auth/forgot-password: Solicitud de restablecimiento de contraseña para email: ${email}`,
    );
    return await this.authService.forgotPassword(email);
  }
}
