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
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';

@ApiTags('transactions')
@Controller('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar transacciones con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'wallet_id', required: false, type: String, description: 'Filtrar transacciones por ID de wallet, si no se envia retorna todas las transacciones' })
  @ApiQuery({ name: 'state_id', required: false, type: String, description: 'Filtrar transacciones por ID de estado, si no se envia retorna todas las transacciones' })
  @ApiQuery({ name: 'type_id', required: false, type: String, description: 'Filtrar transacciones por ID de tipo, si no se envia retorna todas las transacciones' })
  @ApiResponse({ status: 200, description: 'Listado de transacciones retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('wallet_id') wallet_id = '',
    @Query('state_id') state_id = '',
    @Query('type_id') type_id = '',
  ): Promise<[Transaction[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(wallet_id, state_id, type_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una transacción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la transacción' })
  @ApiResponse({ status: 200, description: 'Transacción encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró la transacción' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva transacción' })
  @ApiResponse({ status: 201, description: 'Transacción creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la transacción' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la transacción' })
  async create(@Body() body: CreateTransactionDto): Promise<Transaction> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una transacción existente' })
  @ApiParam({ name: 'id', description: 'UUID de la transacción' })
  @ApiResponse({ status: 200, description: 'Transacción actualizada correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la transacción a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la transacción' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una transacción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la transacción' })
  @ApiResponse({ status: 204, description: 'Transacción eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la transacción a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la transacción (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
