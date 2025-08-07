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
  BadRequestException,
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
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Listar pagos con paginación y filtro exclusivo' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
@ApiQuery({ name: 'group_id', required: false, type: String, description: 'Filtrar por ID de grupo. Si no se envia retorna todos los grupos del usuario.' })
@ApiResponse({ status: 200, description: 'Listado de pagos retornado correctamente' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Req() req: Request,
  @Query('group_id') group_id = '',
): Promise<[Payment[], number]> {
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  return await this.service.findAll(group_id, req.user?.id, pageNumber, limitNumber);
}

@Get(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Obtener un pago por su ID' })
@ApiParam({ name: 'id', description: 'UUID del pago' })
@ApiResponse({ status: 200, description: 'Pago encontrado' })
@ApiResponse({ status: 404, description: 'No se encontró el pago' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Payment> {
  return await this.service.findOne(id);
}

@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Crear un nuevo pago' })
@ApiResponse({ status: 201, description: 'Pago creado exitosamente' })
@ApiResponse({ status: 400, description: 'Datos inválidos para crear el pago' })
@ApiResponse({ status: 500, description: 'Error al crear el miembro' })
async create(@Body() body: CreatePaymentDto): Promise<Payment> {
  return await this.service.create(body);
}

@Put(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Actualizar un pago existente' })
@ApiParam({ name: 'id', description: 'UUID del pago a actualizar' })
@ApiResponse({ status: 200, description: 'Pago actualizado correctamente' })
@ApiResponse({ status: 404, description: 'No se encontró el pago a actualizar' })
@ApiResponse({ status: 500, description: 'Error al actualizar el pago' })
async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdatePaymentDto) {
  return this.service.update(id, body);
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Eliminar un pago por su ID' })
@ApiParam({ name: 'id', description: 'UUID del pago a eliminar' })
@ApiResponse({ status: 204, description: 'Pago eliminado correctamente' })
@ApiResponse({ status: 404, description: 'No se encontró el pago a eliminar' })
@ApiResponse({ status: 409, description: 'No se puede eliminar el pago (conflicto)' })
async remove(@Param('id', ParseUUIDPipe) id: string) {
  await this.service.remove(id);
}

}
