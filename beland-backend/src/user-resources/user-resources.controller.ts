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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { UserResourcesService } from './user-resources.service';
import { UserResource } from './entities/user-resource.entity';
import { Request } from 'express';
import { CreateUserResourceDto } from './dto/create-user-resource.dto';
import { UpdateUserResourceDto } from './dto/update-user-resource.dto';

@ApiTags('user-resources')
@Controller('user-resources')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class UserResourcesController {
  constructor(private readonly service: UserResourcesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar recursos del usuario con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' }) 
  @ApiQuery({ name: 'resource_id', required: false, type: String, description: 'Filtrar por ID del tipo de recurso del usuario. (opcional)' })  
  @ApiResponse({ status: 200, description: 'Listado de recursos del usuario retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('resource_id') resource_id = '',
    @Req() req: Request,
  ): Promise<[UserResource[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user?.id, resource_id, pageNumber, limitNumber);
  }

  @Get('total-available/:resource_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cantidad total de entradas disponibles de un recurso específico' })
  @ApiParam({ name: 'resource_id', description: 'UUID del recurso' })
  @ApiResponse({ status: 200, description: 'Cantidad total de entradas disponibles retornada correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getTotalAvailable(@Param('resource_id', ParseUUIDPipe) resource_id: string) {
    return this.service.getTotalAvailable(resource_id);
  }

  @Get('remaining/:hash_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cantidad de entradas restantes de un recurso de usuario por hash_id' })
  @ApiParam({ name: 'hash_id', description: 'Hash único del recurso comprado' })
  @ApiResponse({ status: 200, description: 'Cantidad de entradas restantes retornada correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso de usuario con ese hash_id' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getRemainingByHash(@Param('hash_id') hash_id: string, @Req() req: Request) {
    return this.service.getRemainingByHash(hash_id, req.user?.id);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un recurso de usuario por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el recurso de usuario' })
  @ApiResponse({ status: 200, description: 'Recurso de usuario encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso de usuario' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResource> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo recurso de usuario' })
  @ApiResponse({ status: 201, description: 'Recurso de usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el recurso de usuario' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el recurso de usuario' })
  async create(@Body() body: CreateUserResourceDto, @Req() req: Request,): Promise<UserResource> {
    return await this.service.create({...body, user_id: req.user?.id});
  }

  @Put('redeem/:hash_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redimir entradas de un recurso de usuario por hash_id' })
  @ApiParam({ name: 'hash_id', description: 'Hash único del recurso comprado' })
  @ApiResponse({ status: 200, description: 'Redención exitosa' })
  @ApiResponse({ status: 400, description: 'Cantidad inválida o excede las entradas disponibles' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso de usuario con ese hash_id' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async redeem(
    @Param('hash_id') hash_id: string,
    @Body('quantity_redeemed') quantity: number,
    @Req() req: Request,
  ) {
    if (quantity === 0) {
      throw new BadRequestException('La cantidad a redimir no puede ser cero');
    }
    return this.service.redeem(hash_id, req.user?.id, quantity);
  }


  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un recurso de usuario existente' })
  @ApiParam({ name: 'id', description: 'UUID de el recurso de usuario' })
  @ApiResponse({ status: 200, description: 'Recurso de usuario actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso de usuario a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el recurso de usuario' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserResourceDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un recurso de usuario por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el recurso de usuario' })
  @ApiResponse({ status: 204, description: 'Recurso de usuario eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso de usuario a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el recurso de usuario (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
