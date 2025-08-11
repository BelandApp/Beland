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
import { TransactionType } from './entities/transaction-type.entity';
import { TransactionTypesService } from './transaction-type.service';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';

@ApiTags('transaction-type')
@Controller('transaction-type')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class TransactionTypesController {
  constructor(private readonly service: TransactionTypesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar tipos de transacciones de transacciones con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de tipos de transacciones de transacciones retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[TransactionType[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tipo de transacción de transacción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de transacción' })
  @ApiResponse({ status: 200, description: 'Tipo de transacción encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de transacción' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TransactionType> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de transacción' })
  @ApiResponse({ status: 201, description: 'Tipo de transacción creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el tipo de transacción' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el tipo de transacción' })
  async create(@Body() body: CreateTransactionTypeDto): Promise<TransactionType> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de transacción existente' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de transacción' })
  @ApiResponse({ status: 200, description: 'Tipo de transacción actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de transacción a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el tipo de transacción' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTransactionTypeDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de transacción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de transacción' })
  @ApiResponse({ status: 204, description: 'Tipo de transacción eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de transacción a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el tipo de transacción (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}

