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
import { BankAccountType } from './entities/bank-account-type.entity';
import { BankAccountTypesService } from './bank-account-type.service';
import { CreateBankAccountTypeDto } from './dto/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from './dto/update-bank-account-type.dto';

@ApiTags('bank-account-types')
@Controller('bank-account-types')
export class BankAccountTypesController {
  constructor(private readonly service: BankAccountTypesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar tipos de cuenta bancaria con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de tipos de cuenta bancaria retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[BankAccountType[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tipo de cuenta bancaria por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Tipo de cuenta bancaria encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de cuenta bancaria' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BankAccountType> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de cuenta bancaria' })
  @ApiResponse({ status: 201, description: 'Tipo de cuenta bancaria creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el tipo de cuenta bancaria' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el tipo de cuenta bancaria' })
  async create(@Body() body: CreateBankAccountTypeDto): Promise<BankAccountType> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de cuenta bancaria existente' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Tipo de cuenta bancaria actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de cuenta bancaria a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el tipo de cuenta bancaria' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBankAccountTypeDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de cuenta bancaria por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de cuenta bancaria' })
  @ApiResponse({ status: 204, description: 'Tipo de cuenta bancaria eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de cuenta bancaria a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el tipo de cuenta bancaria (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
