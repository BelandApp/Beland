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
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { WithdrawAccountType } from './entities/withdraw-account-type.entity';
import { WithdrawAccountTypesService } from './withdraw-account-type.service';
import { CreateWithdrawAccountTypeDto } from './dto/create-withdraw-account-type.dto';
import { UpdateWithdrawAccountTypeDto } from './dto/update-withdraw-account-type.dto';

@ApiTags('withdraw-account-type')
@Controller('withdraw-account-type')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class WithdrawAccountTypesController {
  constructor(private readonly service: WithdrawAccountTypesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar tipos de cuentas con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de tipos de cuentas retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[WithdrawAccountType[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tipo de cuenta por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de cuenta' })
  @ApiResponse({ status: 200, description: 'Tipo de cuenta encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de cuenta' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WithdrawAccountType> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de cuenta' })
  @ApiResponse({ status: 201, description: 'Tipo de cuenta creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el tipo de cuenta' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el tipo de cuenta' })
  async create(@Body() body: CreateWithdrawAccountTypeDto): Promise<WithdrawAccountType> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de cuenta existente' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de cuenta' })
  @ApiResponse({ status: 200, description: 'Tipo de cuenta actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de cuenta a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el tipo de cuenta' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateWithdrawAccountTypeDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de cuenta por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de cuenta' })
  @ApiResponse({ status: 204, description: 'Tipo de cuenta eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de cuenta a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el tipo de cuenta (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}

