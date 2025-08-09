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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/users/entities/users.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Request } from 'express';
import { AuthenticationGuard } from './guards/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard, AuthenticationGuard)
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
    const {password, ...userReturn} = req.user;
    return userReturn;
  }


  // provisorio para las pruebas

  @Post('signup')
  @ApiOperation({ summary: 'Registra usuarios nuevos' })
  @ApiBody({
       description: 'Ingrese todos los datos requeridos',
       type: RegisterAuthDto,
  })
  async signup(@Body() user: RegisterAuthDto): Promise<{ token: string }> {
    return await this.authService.signup(user);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Realiza el Login de usuarios' })
  @ApiBody({ description: 'Las credenciales', type: LoginAuthDto })
  async signin(
    @Body() userLogin: LoginAuthDto
  ): Promise<{ token: string }> {
    return await this.authService.signin(userLogin);
  }

}
