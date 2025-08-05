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
import { TypeBankAccount } from './entities/type-bank-account.entity';
import { TypeBankAccountsService } from './type-bank-account.service';
import { CreateTypeBankAccountDto } from './dto/create-type-bank-account.dto';
import { UpdateTypeBankAccountDto } from './dto/update-type-bank-account.dto';

@ApiTags('orders')
@Controller('orders')
export class TypeBankAccountsController {
  constructor(private readonly service: TypeBankAccountsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar cuentas de banco con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de cuentas de banco retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[TypeBankAccount[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una cuenta de banco por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la cuenta de banco' })
  @ApiResponse({ status: 200, description: 'Cuenta de banco encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró la cuenta de banco' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TypeBankAccount> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva cuenta de banco' })
  @ApiResponse({ status: 201, description: 'Cuenta de banco creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la cuenta de banco' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la cuenta de banco' })
  async create(@Body() body: CreateTypeBankAccountDto): Promise<TypeBankAccount> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una cuenta de banco existente' })
  @ApiParam({ name: 'id', description: 'UUID de la cuenta de banco' })
  @ApiResponse({ status: 200, description: 'Cuenta de banco actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la cuenta de banco a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la cuenta de banco' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTypeBankAccountDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una cuenta de banco por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la cuenta de banco' })
  @ApiResponse({ status: 204, description: 'Cuenta de banco eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la cuenta de banco a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la cuenta de banco (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
