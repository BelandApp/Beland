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
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { Cart } from './entities/cart.entity';
import { CartsService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('coupons')
@Controller('coupons')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class CartsController {
  constructor(private readonly service: CartsService) {}

 @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un carrito por id de usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Carrito encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el carrito' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findByUser(@Param('id', ParseUUIDPipe) id: string): Promise<Cart> {
    return await this.service.findByUser(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un carrito por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del carrito' })
  @ApiResponse({ status: 200, description: 'carrito encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el carrito' })
  @ApiResponse({ status: 500, description: 'Error interno del carrito' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Cart> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo cupón' })
  @ApiResponse({ status: 201, description: 'Cupón creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el cupón' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el cupón' })
  async create(@Body() body: CreateCartDto): Promise<Cart> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un carrito existente' })
  @ApiParam({ name: 'id', description: 'UUID del carrito' })
  @ApiResponse({ status: 200, description: 'Carrito actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el carrito a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el carrito' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCartDto,
  ) {
    return this.service.update(id, body);
  }

  
}
