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
import { WalletsService } from './wallets.service';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { RechargeDto } from './dto/recharge.dto';
import { TransferDto } from './dto/transfer.dto';
import { Request } from 'express';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';

@ApiTags('wallets')
@Controller('wallets')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class WalletsController {
  constructor(private readonly service: WalletsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar billeteras Virtuales con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de cupones retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req : Request,
  ): Promise<[Wallet[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una billetera por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la billetera' })
  @ApiResponse({ status: 200, description: 'Billetera encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Wallet> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva billetera' })
  @ApiResponse({ status: 201, description: 'Billetera creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la billetera' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la billetera' })
  async create(@Body() body: CreateWalletDto): Promise<Wallet> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una billetera existente' })
  @ApiParam({ name: 'id', description: 'UUID de la billetera' })
  @ApiResponse({ status: 200, description: 'Billetera actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la billetera' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateWalletDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una billetera por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la billetera' })
  @ApiResponse({ status: 204, description: 'Billetera eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la billetera (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }

  @Post('recharge')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva recarga o compra de Beicon' })
  @ApiResponse({ status: 201, description: 'Recarga Exitosamente' })
  async recharge(@Body() dto: RechargeDto): Promise<{wallet: Wallet}> {
    return await this.service.recharge(dto);
  }

  /*// tenemos que resolver que hacer con este
  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo Retiro' })
  @ApiParam({ name: 'userId', description: 'UUID del usuario' })
  @ApiResponse({ status: 201, description: 'Retira exitosamente' })
  async withdraw(@Param('userId', ParseUUIDPipe) userId: string, @Body() dto: WithdrawDto): Promise<void> {
    return await this.service.withdraw(userId, dto);
  }*/
  
  @Post('transfer/:wallet_id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva transferencia' })
  @ApiParam({ name: 'wallet_id', description: 'UUID de la billetera' })
  @ApiResponse({ status: 201, description: 'Transferencia Exitosa' })
  async transfer(@Param('wallet_id', ParseUUIDPipe) wallet_id: string, @Body() dto: TransferDto): Promise<{ wallet: Wallet }> {
    return await this.service.transfer(wallet_id, dto);
  }

  
}
