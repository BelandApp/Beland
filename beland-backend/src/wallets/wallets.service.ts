import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WalletsRepository } from './wallets.repository';
import { Wallet } from './entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RechargeDto } from './dto/recharge.dto';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { SuperadminConfigService } from 'src/superadmin-config/superadmin-config.service';

@Injectable()
export class WalletsService {
  private readonly completeMessage = 'la billetera virtual';

  constructor(
    private readonly repository: WalletsRepository,
    private readonly superadminConfig: SuperadminConfigService,
    @InjectRepository(TransactionType)
    private typeRepo: Repository<TransactionType>,
    @InjectRepository(TransactionState)
    private stateRepo: Repository<TransactionState>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
  ) {}

  async findAll(
    user_id: string,
    pageNumber: number,
    limitNumber: number,
  ): Promise<[Wallet[], number]> {
    try {
      const response = await this.repository.findAll(
        user_id,
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<Wallet> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findByUser(user_id: string): Promise<Wallet> {
    try {
      const res = await this.repository.findByUser(user_id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<Wallet>): Promise<Wallet> {
    try {
      // Transformar userId a user_id si viene del DTO de forma segura
      if (body && Object.prototype.hasOwnProperty.call(body, 'userId')) {
        const { userId, ...rest } = body as any;
        body = { ...rest, user_id: userId };
      }
      // Buscar si ya existe una wallet para ese usuario
      if (body.user_id) {
        const existing = await this.repository.findAll(body.user_id, 1, 1);
        if (existing[0].length > 0) {
          return existing[0][0]; // Retorna la primera wallet encontrada
        }
      }
      // Si no existe, crearla
      const res = await this.repository.create(body);
      if (!res)
        throw new InternalServerErrorException(
          `No se pudo crear ${this.completeMessage}`,
        );
      return res;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async update(id: string, body: Partial<Wallet>) {
    try {
      const res = await this.repository.update(id, body);
      if (res.affected === 0)
        throw new NotFoundException(`No se encontró ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      const res = await this.repository.remove(id);
      if (res.affected === 0)
        throw new NotFoundException(`No se encontró ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new ConflictException(
        `No se puede eliminar ${this.completeMessage}`,
      );
    }
  }

  async recharge(user_id:string, dto: RechargeDto): Promise<{ wallet: Wallet }> {
    const wallet = await this.repository.findByUser(user_id);
    if (!wallet) throw new NotFoundException('No se encuentra la billetera');
    // 2) Convertir USD a Becoin

    const becoinAmount = +dto.amountUsd / +this.superadminConfig.getPriceOneBecoin;
    // 3) Actualizar saldo
    wallet.becoin_balance = +wallet.becoin_balance + becoinAmount;
    const type = await this.typeRepo.findOneBy({ code: 'RECHARGE' });
    if (!type)
      throw new ConflictException("No se encuentra el tipo 'RECHARGE'");

    const status = await this.stateRepo.findOneBy({ code: 'COMPLETED' });
    if (!status)
      throw new ConflictException("No se encuentra el estado 'COMPLETED'");

    const walletUpdated: Wallet = await this.repository.create(wallet);

    // 4) Registrar transacción
    await this.txRepo.save({
      wallet_id: wallet.id,
      type_id: type.id,
      status_id: status.id,
      amount: dto.amountUsd,
      amount_beicon: becoinAmount,
      post_balance: wallet.becoin_balance,
      reference: dto.referenceCode,
      payphone_transactionId: dto.payphone_transactionId?.toString(),
      clientTransactionId: dto.clientTransactionId,
    });
    return { wallet: walletUpdated };
  }

  async withdrawBank(walletId: string, dto: WithdrawDto) {
    /*const wallet = await this.repository.findByUserId( userId );
    if (wallet.becoin_balance < dto.amountBecoin) throw new BadRequestException('Saldo insuficiente');
    // 1) Reservar fondos
    wallet.becoin_balance -= dto.amountBecoin;
    wallet.locked_balance += dto.amountBecoin;
    await this.repository.create(wallet);
    // 2) Llamar a PayPhone en USD
    const usd = dto.amountBecoin * 0.05;
    // 3) Liberar locked y registrar
    wallet.locked_balance -= dto.amountBecoin;
    await this.repository.create(wallet);
    const type = await this.typeRepo.findOneBy({code:'WITHDRAW'})
    if (!type) throw new ConflictException ("No se encuentra el tipo 'WITHDRAW'")
    const tx = this.txRepo.create({
      wallet_id: wallet.id,
      type,
      amount: -dto.amountBecoin,
      post_balance: wallet.becoin_balance,
      reference: payout.id,
      created_at: new Date(),
    });
    await this.txRepo.save(tx);
    return { wallet, tx };*/
    return;
  }

  async withdrawPayphone(walletId: string, dto: WithdrawDto) {
    /*const wallet = await this.repository.findByUserId( userId );
    if (wallet.becoin_balance < dto.amountBecoin) throw new BadRequestException('Saldo insuficiente');
    // 1) Reservar fondos
    wallet.becoin_balance -= dto.amountBecoin;
    wallet.locked_balance += dto.amountBecoin;
    await this.repository.create(wallet);
    // 2) Llamar a PayPhone en USD
    const usd = dto.amountBecoin * 0.05;
    // 3) Liberar locked y registrar
    wallet.locked_balance -= dto.amountBecoin;
    await this.repository.create(wallet);
    const type = await this.typeRepo.findOneBy({code:'WITHDRAW'})
    if (!type) throw new ConflictException ("No se encuentra el tipo 'WITHDRAW'")
    const tx = this.txRepo.create({
      wallet_id: wallet.id,
      type,
      amount: -dto.amountBecoin,
      post_balance: wallet.becoin_balance,
      reference: payout.id,
      created_at: new Date(),
    });
    await this.txRepo.save(tx);
    return { wallet, tx };*/
    return;
  }

  async transfer(
    user_id: string,
    dto: TransferDto,
    code_transaction_send: string = 'TRANSFER_SEND',
    code_transaction_received: string = 'TRANSFER_RECEIVED',
  ): Promise<{ wallet: Wallet }> {
    const from = await this.repository.findByUser(user_id);
    if (!from) throw new NotFoundException('No se encuentra la Billetera');
    if (Number(from.becoin_balance) < dto.amountBecoin)
      throw new BadRequestException('Saldo insuficiente');
    const to = await this.repository.findOne(dto.toWalletId);
    if (!to) throw new NotFoundException('Billetera destino no existe');
    // 1) Debitar origen
    from.becoin_balance = +from.becoin_balance - dto.amountBecoin;

    let type = await this.typeRepo.findOneBy({ code: code_transaction_send });
    if (!type)
      throw new ConflictException("No se encuentra el tipo ", code_transaction_send);

    const status = await this.stateRepo.findOneBy({ code: 'COMPLETED' });
    if (!status)
      throw new ConflictException("No se encuentra el estado 'COMPLETED'");

    const walletUpdate = await this.repository.create(from);

    const txFrom = this.txRepo.save({
      wallet_id: from.id,
      type,
      status,
      amount: -dto.amountBecoin,
      post_balance: from.becoin_balance,
      related_wallet_id: to.id,
      reference: `${code_transaction_send}-${dto.toWalletId}`
    });

    // 2) Acreditar destino
    type = await this.typeRepo.findOneBy({ code: code_transaction_received });
    if (!type)
      throw new ConflictException("No se encuentra el tipo ", code_transaction_received);

    to.becoin_balance = +to.becoin_balance + dto.amountBecoin;
    await this.repository.create(to);

    const txTo = this.txRepo.save({
      wallet_id: to.id,
      type,
      status,
      amount: dto.amountBecoin,
      post_balance: to.becoin_balance,
      related_wallet_id: from.id,
      reference: `${code_transaction_received}-${from.id}`
    });

    return { wallet: walletUpdate };
  }

  async purchaseBeland(
    wallet_id: string,
    becoinAmount: number,
    referenceCode: string,
  ) {
    const wallet = await this.repository.findOne(wallet_id);
    if (!wallet) throw new NotFoundException('No se encuentra la billetera');

    // 3) Actualizar saldo
    if (+wallet.becoin_balance < becoinAmount) throw new ConflictException('Saldo insuficiente');

    wallet.becoin_balance = +wallet.becoin_balance - becoinAmount;
    const type = await this.typeRepo.findOneBy({ code: 'PURCHASE_BELAND' });
    if (!type)
      throw new ConflictException("No se encuentra el tipo 'PURCHASE_BELAND'");

    const status = await this.stateRepo.findOneBy({ code: 'COMPLETED' });
    if (!status)
      throw new ConflictException("No se encuentra el estado 'COMPLETED'");

    const walletUpdated: Wallet = await this.repository.create(wallet);

    // 4) Registrar transacción
    await this.txRepo.save({
      wallet_id: wallet.id,
      type_id: type.id,
      status_id: status.id,
      amount: becoinAmount,
      post_balance: wallet.becoin_balance,
      reference: referenceCode,
    });
    return { wallet: walletUpdated };
  }

}
