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
import { TransactionCode } from 'src/transactions/enum/transaction-code';
import { RespCobroDto } from './dto/resp-cobro.dto';
import { PaymentWithRechargeDto } from './dto/payment-with-recharge.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

@ApiTags('wallets')
@Controller('wallets')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class WalletsController {
  constructor(
    private readonly service: WalletsService,
    private readonly superadminConfig: SuperadminConfigService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar billeteras Virtuales con paginación' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Cantidad de elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de cupones retornado correctamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[Wallet[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una billetera por su Usuario' })
  @ApiResponse({ status: 200, description: 'Billetera encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findByUser(@Req() req: Request): Promise<Wallet> {
    return await this.service.findByUser(req.user.id);
  }

  @Get('qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una billetera por su Usuario' })
  @ApiResponse({ status: 200, description: 'Billetera encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findQRByUser(@Req() req: Request): Promise<{ qr: string }> {
    console.log(
      '[WalletsController] findQRByUser - user.id recibido:',
      req.user?.id,
    );
    const wallet = await this.service.findByUser(req.user?.id);
    if (!wallet) {
      console.log(
        '[WalletsController] No se encontró wallet para user.id:',
        req.user?.id,
      );
    } else {
      console.log(
        '[WalletsController] Wallet encontrada:',
        wallet.id,
        'QR:',
        wallet.qr?.slice(0, 30) + '...',
      );
    }
    return { qr: wallet?.qr };
  }

  @Get('alias/:alias')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una billetera por su Alias' })
  @ApiParam({ name: 'alias', description: 'alias buscado de la billetera' })
  @ApiResponse({ status: 200, description: 'Billetera encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró la billetera' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findByAlias(@Param('alias') alias: string): Promise<Wallet> {
    return await this.service.findByAlias(alias);
  }

  @Get('data-Payment/:wallet_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener información para generar el pago' })
  @ApiParam({
    name: 'wallet_id',
    description: 'UUID de la wallet del comercio en el qr escaneado',
  })
  @ApiResponse({ status: 200, description: 'Informacion de Pago exitosa' })
  @ApiResponse({ status: 404, description: 'Wallet no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async dataPayment(
    @Param('wallet_id') wallet_id: string,
    @Req() req: Request,
  ): Promise<RespCobroDto> {
    return await this.service.dataPayment(wallet_id, req.user.id);
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
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para crear la billetera',
  })
  @ApiResponse({ status: 500, description: 'No se pudo crear la billetera' })
  async create(@Body() body: CreateWalletDto): Promise<Wallet> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una billetera existente' })
  @ApiParam({ name: 'id', description: 'UUID de la billetera' })
  @ApiResponse({
    status: 200,
    description: 'Billetera actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la billetera a actualizar',
  })
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
  @ApiResponse({
    status: 204,
    description: 'Billetera eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la billetera a eliminar',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar la billetera (conflicto)',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }

  // RECARGA DE BECOIN EN CUENTA
  @Post('recharge')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva recarga o compra de Beicon' })
  @ApiResponse({ status: 201, description: 'Recarga Exitosamente' })
  async recharge(
    @Body() dto: RechargeDto,
    @Req() req: Request,
  ): Promise<{ wallet: Wallet }> {
    console.log('[WalletsController] Recarga recibida:', dto);
    return await this.service.recharge(req.user?.id, dto);
  }

  // ENPOINT PARA EXTRACCIONES MANUALES
  // SOLICITA RETIRO, QUEDA EN PENDIENTE
  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una Solicitud de Retiro' })
  @ApiResponse({ status: 201, description: 'Solicita Retira exitosamente' })
  async withdraw(
    @Req() req: Request,
    @Body() dto: WithdrawDto,
  ): Promise<{ wallet: Wallet }> {
    return await this.service.withdraw(req.user?.id, dto);
  }
  // SI LA TRANSFERENCIA FALLA LLAMA ESTE ENDPOINT
  @Post('withdraw-failed')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Completa el Flujo de retiro para una transaccion fallida en la cuenta del usuario',
  })
  @ApiResponse({
    status: 201,
    description: 'Se registro el Fallo y se reestablecieron los saldos',
  })
  async withdrawFailed(
    @Body() dto: WithdrawResponseDto,
  ): Promise<{ wallet: Wallet }> {
    return await this.service.withdrawFailed(dto);
  }
  // SI LA TRANSFERENCIA SALE BIEN LLAMA ESTE ENDPOINT
  @Post('withdraw-completed')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Completa el Flujo de retiro para una transaccion exitosa en la cuenta del usuario',
  })
  @ApiResponse({ status: 201, description: 'Retira exitosamente' })
  async withdrawCompleted(
    @Body() dto: WithdrawResponseDto,
  ): Promise<{ wallet: Wallet }> {
    return await this.service.withdrawCompleted(dto);
  }
  // FIN DE ENPOINT PARA EXTRACCIONES

  // TRANSFERENCIAS ENTRE USUARIOS
  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva transferencia' })
  @ApiResponse({ status: 201, description: 'Transferencia Exitosa' })
  async transfer(
    @Req() req: Request,
    @Body() dto: TransferDto,
  ): Promise<{ wallet: Wallet }> {
    return await this.service.transfer(
      req.user?.id,
      dto,
      TransactionCode.TRANSFER_SEND,
      TransactionCode.TRANSFER_RECEIVED,
    );
  }

  // COMPRAS CON BECOIN EN WALLET
  @Post('purchase-becoin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Crear una nueva compra a una entidad con becoin. Por medio de QR (debe desencriptarse u enviar el uuid de la wallet del vendedor contenido)',
  })
  @ApiResponse({ status: 201, description: 'Compra Exitosamente' })
  async purchaseBecoin(
    @Req() req: Request,
    @Body() dto: TransferDto,
  ): Promise<{ wallet: Wallet }> {
    return await this.service.transfer(req.user?.id, dto);
  }

  //COMPRAS DIRECTO CON TARJETA O PAYPHONE.
  @Post('purchase-recharge/:to_wallet_id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Crear una nueva compra a una entidad. Por medio de QR (debe desencriptarse y enviar el uuid de la wallet contenido de la entidad)',
  })
  @ApiParam({
    name: 'to_wallet_id',
    description: 'UUID de la billetera que compra',
  })
  @ApiResponse({ status: 201, description: 'Compra Exitosamente' })
  async purchase(
    @Param('to_wallet_id', ParseUUIDPipe) to_wallet_id: string,
    @Body() dto: PaymentWithRechargeDto,
    @Req() req: Request,
  ): Promise<{ wallet: Wallet }> {

    let amountBecoin = 0;
    const priceOneBecoin = Number(this.superadminConfig.getPriceOneBecoin());
    if (priceOneBecoin !== 0.05) {
      throw new InternalServerErrorException(
        'El precio de BeCoin no es válido',
      );
    }

    const amount_payment_id = dto.amount_payment_id;
    const user_resource_id = dto.user_resource_id;

    return await this.service.transfer(
        req.user?.id,
        {
          toWalletId: to_wallet_id,
          amountBecoin,
          amount_payment_id,
          user_resource_id,
        },
      );
  }
}
