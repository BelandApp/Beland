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
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { UserWithdraw } from './entities/user-withdraw.entity';
import { UserWithdrawsService } from './user-withdraw.service';
import { Request } from 'express';
import { CreateUserWithdrawDto } from './dto/create-user-withdraw.dto';
import { UpdateUserWithdrawDto } from './dto/update-user-withdraw.dto';

@ApiTags('user-withdraw')
@Controller('user-withdraw')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class UserWithdrawsController {
  constructor(private readonly service: UserWithdrawsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar retiros con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'state_id', required: false, type: String, description: 'Filtrar retiros por ID de estado' })
  @ApiQuery({ name: 'type_id', required: false, type: String, description: 'Filtrar retiros por ID de tipo' })
  @ApiResponse({ status: 200, description: 'Listado de retiros retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req: Request,
    @Query('state_id') state_id = '',
    @Query('type_id') type_id = '',
  ): Promise<[UserWithdraw[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user?.id, state_id, type_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una extracción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la extracción' })
  @ApiResponse({ status: 200, description: 'Extracción encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró la extracción' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserWithdraw> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva extracción' })
  @ApiResponse({ status: 201, description: 'Extracción creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la extracción' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la extracción' })
  async create(@Body() body: CreateUserWithdrawDto): Promise<UserWithdraw> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una extracción existente' })
  @ApiParam({ name: 'id', description: 'UUID de la extracción' })
  @ApiResponse({ status: 200, description: 'Extracción actualizada correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la extracción a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la extracción' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserWithdrawDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una extracción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la extracción' })
  @ApiResponse({ status: 204, description: 'Extracción eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la extracción a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la extracción (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
