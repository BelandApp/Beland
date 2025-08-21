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
import { WalletType } from './entities/wallet-type.entity';
import { WalletTypesService } from './wallet-types.service';
import { CreateWalletTypeDto } from './dto/create-wallet-type.dto';
import { UpdateWalletTypeDto } from './dto/update-wallet-type.dto';

@ApiTags('wallet-type')
@Controller('wallet-type')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class WalletTypesController {
  constructor(private readonly service: WalletTypesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar tipos de billeteras con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de tipos de billeteras retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[WalletType[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tipo de billetera por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de billetera' })
  @ApiResponse({ status: 200, description: 'Tipo de billetera encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de billetera' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WalletType> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de billetera' })
  @ApiResponse({ status: 201, description: 'Tipo de billetera creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el tipo de billetera' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el tipo de billetera' })
  async create(@Body() body: CreateWalletTypeDto): Promise<WalletType> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de billetera existente' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de billetera' })
  @ApiResponse({ status: 200, description: 'Tipo de billetera actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de billetera a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el tipo de billetera' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateWalletTypeDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de billetera por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de billetera' })
  @ApiResponse({ status: 204, description: 'Tipo de billetera eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de billetera a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el tipo de billetera (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}

