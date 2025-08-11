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
import { TransactionState } from './entities/transaction-state.entity';
import { TransactionStatesService } from './transaction-state.service';
import { CreateTransactionStateDto } from './dto/create-transaction-state.dto';
import { UpdateTransactionStateDto } from './dto/update-transaction-state.dto';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';

@ApiTags('transaction-state')
@Controller('transaction-state')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class TransactionStatesController {
  constructor(private readonly service: TransactionStatesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar estados de transacciones con paginación' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Cantidad de elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de estados de transacciones retornado correctamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[TransactionState[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un estado de transacción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el estado de transacción' })
  @ApiResponse({ status: 200, description: 'Estado de transacción encontrado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el estado de transacción',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionState> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo estado de transacción' })
  @ApiResponse({
    status: 201,
    description: 'Estado de transacción creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para crear el estado de transacción',
  })
  @ApiResponse({
    status: 500,
    description: 'No se pudo crear el estado de transacción',
  })
  async create(
    @Body() body: CreateTransactionStateDto,
  ): Promise<TransactionState> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un estado de transacción existente' })
  @ApiParam({ name: 'id', description: 'UUID de el estado de transacción' })
  @ApiResponse({
    status: 200,
    description: 'Estado de transacción actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el estado de transacción a actualizar',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al actualizar el estado de transacción',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTransactionStateDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un estado de transacción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el estado de transacción' })
  @ApiResponse({
    status: 204,
    description: 'Estado de transacción eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el estado de transacción a eliminar',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar el estado de transacción (conflicto)',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
