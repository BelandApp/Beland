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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly service: WalletsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar billeteras Virtuales con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de cupones retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[Wallet[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get('/user/:user_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una billetera por su ID de usuario' })
  @ApiParam({ name: 'user_id', description: 'UUID de la billetera' })
  @ApiResponse({ status: 200, description: 'Billetera encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findByUserId(@Param('user_id', ParseUUIDPipe) user_id: string): Promise<Wallet> {
    return await this.service.findByUserId(user_id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una billetera por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la billetera' })
  @ApiResponse({ status: 200, description: 'Billetera encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Wallet> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva billetera' })
  @ApiResponse({ status: 201, description: 'Billetera creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la billetera' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la billetera' })
  async create(@Body() body: CreateWalletDto): Promise<Wallet> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una billetera existente' })
  @ApiParam({ name: 'id', description: 'UUID de la billetera' })
  @ApiResponse({ status: 200, description: 'Billetera actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la billetera' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateWalletDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una billetera por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la billetera' })
  @ApiResponse({ status: 204, description: 'Billetera eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la billetera (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
