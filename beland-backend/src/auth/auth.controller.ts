import {
  Controller,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/users/entities/users.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @UseGuards(JwtAuthGuard)
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
  getProfile(@Req() req: Request): CreateUserDto {
    const user = req['user'] as User;
    return plainToInstance(CreateUserDto, user);
  }
}
