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
import { SuperadminConfigService } from 'src/superadmin-config/superadmin-config.service';
import { WithdrawDto, WithdrawResponseDto } from './dto/withdraw.dto';

@ApiTags('wallets')
@Controller('wallets')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class WalletsController {
  constructor(private readonly service: WalletsService,
    private readonly superadminConfig: SuperadminConfigService,
  ) {}

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
  async recharge(@Body() dto: RechargeDto, @Req() req: Request): Promise<{wallet: Wallet}> {
    return await this.service.recharge(req.user?.id, dto);
  }

  // tenemos que resolver que hacer con este
  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo Retiro' })
  @ApiResponse({ status: 201, description: 'Retira exitosamente' })
  async withdraw(@Req() req: Request, @Body() dto: WithdrawDto): Promise<{wallet: Wallet}> {
    return await this.service.withdraw(req.user?.id, dto);
  }

  @Post('withdrawFailed')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo Retiro' })
  @ApiResponse({ status: 201, description: 'Retira exitosamente' })
  async withdrawFailed( @Body() dto: WithdrawResponseDto): Promise<{wallet: Wallet}> {
    return await this.service.withdrawFailed( dto );
  }

  @Post('withdrawCompleted')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo Retiro' })
  @ApiResponse({ status: 201, description: 'Retira exitosamente' })
  async withdrawCompleted(@Body() dto: WithdrawResponseDto): Promise<{wallet: Wallet}> {
    return await this.service.withdrawCompleted(dto);
  }
  
  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva transferencia' })
  @ApiResponse({ status: 201, description: 'Transferencia Exitosa' })
  async transfer(@Req() req: Request, @Body() dto: TransferDto): Promise<{ wallet: Wallet }> {
    return await this.service.transfer(req.user?.id, dto);
  }

  @Post('purchase-becoin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva compra a una entidad con becoin. Por medio de QR (debe desencriptarse u enviar el uuid de la wallet del vendedor contenido)' })
  @ApiResponse({ status: 201, description: 'Compra Exitosamente' })
  async purchaseBecoin(@Req() req: Request, @Body() dto: TransferDto): Promise<{wallet: Wallet}> {
    return await this.service.transfer(
      req.user?.id, 
      dto,
      'PURCHASE',
      'SEND',
    );
  }

  @Post('purchase-recharge/:to_wallet_id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva compra a una entidad. Por medio de QR (debe desencriptarse u enviar el uuid de la wallet del vendedor contenido)' })
  @ApiParam({ name: 'to_wallet_id', description: 'UUID de la billetera que compra' })
  @ApiResponse({ status: 201, description: 'Compra Exitosamente' })
  async purchase(
    @Param('to_wallet_id', ParseUUIDPipe) to_wallet_id: string, 
    @Body() dto: RechargeDto,
    @Req() req: Request,
  ): Promise<{wallet: Wallet}> {
    await this.service.recharge(req.user?.id, dto);
    const toWalletId = to_wallet_id;
    const amountBecoin = dto.amountUsd / +this.superadminConfig.getPriceOneBecoin;
    return await this.service.transfer(
      req.user?.id,
      {toWalletId, amountBecoin},
      'PURCHASE',
      'SEND',
    );
  }
}
