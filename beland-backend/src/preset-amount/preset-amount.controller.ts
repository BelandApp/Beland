import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { PresetAmount } from './entities/preset-amount.entity';
import { PresetAmountsService } from './preset-amount.service';
import { CreatePresetAmountDto } from './dto/create-preset-amount.dto';
import { UpdatePresetAmountDto } from './dto/update-preset-amount.dto';

@ApiTags('preset-amount')
@Controller('preset-amount')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class PresetAmountsController {
  constructor(private readonly service: PresetAmountsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar montos preestablecidos con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de montos preestablecidos retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req: Request,
  ): Promise<[PresetAmount[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un monto preestablecido por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del monto preestablecido' })
  @ApiResponse({ status: 200, description: 'Monto preestablecido encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el monto preestablecido' })
  @ApiResponse({ status: 500, description: 'Error interno del monto preestablecido' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PresetAmount> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo monto preestablecido' })
  @ApiResponse({ status: 201, description: 'Monto preestablecido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el monto preestablecido' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el monto preestablecido' })
  async create(@Body() body: CreatePresetAmountDto, @Req() req: Request ): Promise<PresetAmount> {
    return await this.service.create({...body, user_commerce_id: req.user.id});
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un monto preestablecido existente' })
  @ApiParam({ name: 'id', description: 'UUID del monto preestablecido' })
  @ApiResponse({ status: 200, description: 'Monto preestablecido actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el monto preestablecido a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el monto preestablecido' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePresetAmountDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una monto preestablecido por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la monto preestablecido' })
  @ApiResponse({ status: 204, description: 'Monto preestablecido eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la monto preestablecido a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la monto preestablecido (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
  
}
