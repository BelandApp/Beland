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
import { AmountToPayment } from './entities/amount-to-payment.entity';
import { AmountToPaymentsService } from './amount-to-payment.service';
import { CreateAmountToPaymentDto } from './dto/create-amount-to-payment.dto';
import { UpdateAmountToPaymentDto } from './dto/update-amount-to-payment.dto';

@ApiTags('amount-to-payment')
@Controller('amount-to-payment')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class AmountToPaymentsController {
  constructor(private readonly service: AmountToPaymentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar montos a cobrar con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de montos a cobrar retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req: Request,
  ): Promise<[AmountToPayment[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un monto a cobrar por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del monto a cobrar' })
  @ApiResponse({ status: 200, description: 'Monto a cobrar encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el monto a cobrar' })
  @ApiResponse({ status: 500, description: 'Error interno del monto a cobrar' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AmountToPayment> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo monto a cobrar' })
  @ApiResponse({ status: 201, description: 'Monto a cobrar creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el monto a cobrar' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el monto a cobrar' })
  async create(@Body() body: CreateAmountToPaymentDto, @Req() req: Request ): Promise<AmountToPayment> {
    return await this.service.create({...body, user_commerce_id: req.user.id});
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un monto a cobrar existente' })
  @ApiParam({ name: 'id', description: 'UUID del monto a cobrar' })
  @ApiResponse({ status: 200, description: 'Monto a cobrar actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el monto a cobrar a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el monto a cobrar' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAmountToPaymentDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una monto a cobrar por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la monto a cobrar' })
  @ApiResponse({ status: 204, description: 'Monto a cobrar eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la monto a cobrar a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la monto a cobrar (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
  
}
