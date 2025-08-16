import {
  Controller,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { User } from 'src/users/entities/users.entity';
// Import CreateUserDto and RegisterAuthDto as they define the schemas
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Request } from 'express';
import { AuthenticationGuard } from './guards/auth.guard';
import { FlexibleAuthGuard } from './guards/flexible-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
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
    const { password, ...userReturn } = req.user;
    return userReturn;
  }

  @Post('signup')
  @ApiOperation({ summary: 'Registra usuarios nuevos' })
  @ApiBody({
    description:
      'Ingrese todos los datos requeridos para el registro de usuario',
    // --- START: Explicitly define schema for Swagger UI example ---
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
      // --- IMPORTANT: List all REQUIRED fields here ---
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
    // --- END: Explicitly define schema ---
  })
  async signup(@Body() user: RegisterAuthDto): Promise<{ token: string }> {
    return await this.authService.signup(user);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Realiza el Login de usuarios' })
  @ApiBody({ description: 'Las credenciales', type: LoginAuthDto })
  async signin(@Body() userLogin: LoginAuthDto): Promise<{ token: string }> {
    return await this.authService.signin(userLogin);
  }

    @Post('signupNew')
  @ApiOperation({ summary: 'Registra usuarios nuevos' })
  @ApiBody({
    description:
      'Ingrese todos los datos requeridos para el registro de usuario',
    // --- START: Explicitly define schema for Swagger UI example ---
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
      // --- IMPORTANT: List all REQUIRED fields here ---
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
    // --- END: Explicitly define schema ---
  })
  async signupNew(@Body() user: RegisterAuthDto): Promise<{ token: string }> {
    return await this.authService.signupNew(user);
  }
}
