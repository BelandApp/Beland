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
import { PaymentMethod } from 'src/payment_methods/entities/payment_method.entity';
import { Repository } from 'typeorm';
import { PayphoneService } from 'src/payphone/payphone.service';
import { RechargeDto } from './dto/recharge.dto';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';

@Injectable()
export class WalletsService {
  private readonly completeMessage = 'la billetera virtual';
  private readonly priceOneBecoin = 0.05;

  constructor(
    private readonly repository: WalletsRepository,
    private readonly payphone: PayphoneService,
    @InjectRepository(TransactionType) private typeRepo: Repository<TransactionType>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(PaymentMethod) private pmRepo: Repository<PaymentMethod>,
  ) {}

  async findAll(
    pageNumber: number,
    limitNumber: number,
  ): Promise<[Wallet[], number]> {
    try {
      const response = await this.repository.findAll(
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findByUserId(user_id: string): Promise<Wallet> {
    try {
      const res = await this.repository.findByUserId(user_id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
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

  async create(body: Partial<Wallet>): Promise<Wallet> {
    try {
      const res = await this.repository.create(body);
      if (!res)
        throw new InternalServerErrorException(
          `No se pudo crear ${this.completeMessage}`,
        );
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, body: Partial<Wallet>) {
    try {
      const res = await this.repository.update(id, body);
      if (res.affected === 0)
        throw new NotFoundException(
          `No se encontró ${this.completeMessage}`,
        );
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      const res = await this.repository.remove(id);
      if (res.affected === 0)
        throw new NotFoundException(
          `No se encontró ${this.completeMessage}`,
        );
      return res;
    } catch (error) {
      throw new ConflictException(`No se puede eliminar ${this.completeMessage}`);
    }
  }

  async recharge(userId: string, dto: RechargeDto): Promise<{wallet: Wallet, tx: Transaction}> {
    const wallet = await this.repository.findByUserId( userId );
    const pm = await this.pmRepo.findOneBy({ id: dto.paymentMethodId, user_id: userId });
    // 1) Llamar a PayPhone
    const charge = await this.payphone.createCharge(dto.amountUsd, pm.token, `recarga-${Date.now()}`);
    // 2) Convertir USD a Becoin
    const becoinAmount = dto.amountUsd / this.priceOneBecoin;
    // 3) Actualizar saldo
    wallet.becoin_balance += becoinAmount;
    await this.repository.create(wallet);
    const type = await this.typeRepo.findOneBy({code:'RECHARGE'})
    if (!type) throw new ConflictException ("No se encuentra el tipo 'RECHARGE'")
    // 4) Registrar transacción
    const tx = this.txRepo.create({
      wallet_id: wallet.id,
      type,
      amount: becoinAmount,
      post_balance: wallet.becoin_balance,
      reference: charge.id,
    });
    await this.txRepo.save(tx);
    return { wallet, tx };
  }

  async withdraw(userId: string, dto: WithdrawDto): Promise<{wallet: Wallet, tx: Transaction}> {
    const wallet = await this.repository.findByUserId( userId );
    if (wallet.becoin_balance < dto.amountBecoin) throw new BadRequestException('Saldo insuficiente');
    // 1) Reservar fondos
    wallet.becoin_balance -= dto.amountBecoin;
    wallet.locked_balance += dto.amountBecoin;
    await this.repository.create(wallet);
    // 2) Llamar a PayPhone en USD
    const usd = dto.amountBecoin * 0.05;
    const payout = await this.payphone.createPayout(usd, dto.bankAccount, `retiro-${Date.now()}`);
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
    return { wallet, tx };
  }

  async transfer(userId: string, dto: TransferDto): Promise<{ from: Transaction, to: Transaction }> {
    const from = await this.repository.findByUserId( userId );
    if (from.becoin_balance < dto.amountBecoin) throw new BadRequestException('Saldo insuficiente');
    const to = await this.repository.findByUserId( dto.toUserId );
    if (!to) throw new NotFoundException('Usuario destino no existe');
    // 1) Debitar origen
    from.becoin_balance -= dto.amountBecoin;
    await this.repository.create(from);
    const type = await this.typeRepo.findOneBy({code:'TRANSFER'})
    if (!type) throw new ConflictException ("No se encuentra el tipo 'TRANSFER'")
    const txFrom = this.txRepo.create({
      wallet_id: from.id,
      type,
      amount: -dto.amountBecoin,
      post_balance: from.becoin_balance,
      related_wallet_id: to.id,
      created_at: new Date(),
    });
    await this.txRepo.save(txFrom);
    // 2) Acreditar destino
    to.becoin_balance += dto.amountBecoin;
    await this.repository.create(to);
    const txTo = this.txRepo.create({
      wallet_id: to.id,
      type,
      amount: dto.amountBecoin,
      post_balance: to.becoin_balance,
      related_wallet_id: from.id,
      created_at: new Date(),
    });
    await this.txRepo.save(txTo);
    return { from: txFrom, to: txTo };
  }

    /** CONFIRMAR que una recarga (charge) fue exitosa */
  async confirmRecharge(reference: string): Promise<void> {
    /*const tx = await this.txRepo.findOne({ where: { reference, type: 'RECHARGE' } });
    if (!tx || tx.status !== 'PENDING') return;
    // Marca la transacción como completada
    tx.status = 'COMPLETED';
    await this.txRepo.save(tx);*/
    // (Opcional) aquí podrías emitir un evento o notificación al usuario
  }

  /** MARCAR recarga como fallida y revertir saldo si fuera necesario */
  async failRecharge(reference: string, reason: string): Promise<void> {
    /*const tx = await this.txRepo.findOne({ where: { reference, type: 'RECHARGE' } });
    if (!tx || tx.status !== 'PENDING') return;
    const wallet = await this.repository.findOne(tx.wallet_id);
    // Revertir el saldo
    wallet.becoin_balance -= tx.amount;
    await this.repository.create(wallet);
    tx.status = 'FAILED';
    tx.reference += ` | reason: ${reason}`;
    await this.txRepo.save(tx);*/
  }

  /** CONFIRMAR que un retiro (payout) fue completado */
  async confirmWithdraw(reference: string): Promise<void> {
    /*const tx = await this.txRepo.findOne({ where: { reference, type: 'WITHDRAW' } });
    if (!tx || tx.status !== 'PENDING') return;
    tx.status = 'COMPLETED';
    await this.txRepo.save(tx);*/
    // Los fondos ya estaban descontados y bloqueados en creación de payout
  }

  /** MARCAR retiro como fallido y deshacer lock de fondos */
  async failWithdraw(reference: string, reason: string): Promise<void> {
    const tx = await this.txRepo.findOne({ 
      where: { reference, type: { code: 'WITHDRAW'} },
      relations: ['state', 'type'], 
    });
    if (!tx || tx.status.code !== 'PENDING') return;
    const wallet = await this.repository.findOne( tx.wallet_id );
    // Desbloquear y devolver el monto al balance disponible
    wallet.locked_balance -= Math.abs(tx.amount);
    wallet.becoin_balance += Math.abs(tx.amount);
    await this.repository.create(wallet);
    //tx.status = 'FAILED';
    tx.reference += ` | reason: ${reason}`;
    await this.txRepo.save(tx);
  }

}
