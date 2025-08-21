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
import { Request } from 'express';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { WithdrawAccount } from './entities/withdraw-account.entity';
import { WithdrawAccountsService } from './withdraw-account.service';
import { CreateWithdrawAccountDto } from './dto/create-withdraw-account.dto';
import { UpdateWithdrawAccountDto } from './dto/update-withdraw-account.dto';

@ApiTags('bank_account')
@Controller('bank_account')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class WithdrawAccountsController {
  constructor(private readonly service: WithdrawAccountsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar cuentas de retiro con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de cuentas de retiro retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req: Request,
  ): Promise<[WithdrawAccount[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user?.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una cuenta de retiro por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la cuenta de retiro' })
  @ApiResponse({ status: 200, description: 'Cuenta de retiro encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró la cuenta de retiro' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WithdrawAccount> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva cuenta de retiro' })
  @ApiResponse({ status: 201, description: 'Cuenta de retiro creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la cuenta de retiro' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la cuenta de retiro' })
  async create(@Body() body: CreateWithdrawAccountDto): Promise<WithdrawAccount> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una cuenta de retiro existente' })
  @ApiParam({ name: 'id', description: 'UUID de la cuenta de retiro' })
  @ApiResponse({ status: 200, description: 'Cuenta de retiro actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la cuenta de retiro a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la cuenta de retiro' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateWithdrawAccountDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una cuenta de retiro por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la cuenta de retiro' })
  @ApiResponse({ status: 204, description: 'Cuenta de retiro eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la cuenta de retiro a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la cuenta de retiro (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
