import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { UserAddress } from './entities/user-address.entity';
import { UserAddressService } from './user-address.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';

@ApiTags('user-address')
@Controller('user-address')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class UserAddressController {
  constructor(private readonly service: UserAddressService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar direcciones con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de direcciones retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req: Request,
  ): Promise<[UserAddress[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user?.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una dirección por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la dirección' })
  @ApiResponse({ status: 200, description: 'Dirección encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró la dirección' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserAddress> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva dirección' })
  @ApiResponse({ status: 201, description: 'Dirección creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la dirección' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la dirección' })
  async create(@Body() body: CreateUserAddressDto): Promise<UserAddress> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una dirección existente' })
  @ApiParam({ name: 'id', description: 'UUID de la dirección' })
  @ApiResponse({ status: 200, description: 'Dirección actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la dirección a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la dirección' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserAddressDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una dirección por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la dirección' })
  @ApiResponse({ status: 204, description: 'Dirección eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la dirección a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la dirección (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
