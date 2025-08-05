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
import { PaymentMethod } from './entities/payment_method.entity';
import { PaymentMethodsService } from './payment_methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment_method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment_method.dto';

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar metodos de pago con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filtrar metodos de pago por ID de usuario, si no se envia retorna todos los metodos de pago' })
  @ApiResponse({ status: 200, description: 'Listado de metodos de pago retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('user_id') user_id = '',
  ): Promise<[PaymentMethod[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(user_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un metodo de pago por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del metodo de pago' })
  @ApiResponse({ status: 200, description: 'Metodo de pago encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el metodo de pago' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentMethod> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo metodo de pago' })
  @ApiResponse({ status: 201, description: 'Metodo de pago creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el metodo de pago' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el metodo de pago' })
  async create(@Body() body: CreatePaymentMethodDto): Promise<PaymentMethod> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un metodo de pago existente' })
  @ApiParam({ name: 'id', description: 'UUID del metodo de pago' })
  @ApiResponse({ status: 200, description: 'Metodo de pago actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el metodo de pago a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el metodo de pago' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePaymentMethodDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un metodo de pago por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del metodo de pago' })
  @ApiResponse({ status: 204, description: 'Metodo de pago eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el metodo de pago a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el metodo de pago (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
