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

@Injectable()
export class WalletsService {
  private readonly completeMessage = 'la billetera virtual';
  private readonly priceOneBecoin = 0.05;

  constructor(
    private readonly repository: WalletsRepository,
    @InjectRepository(TransactionType) private typeRepo: Repository<TransactionType>,
    @InjectRepository(TransactionState) private stateRepo: Repository<TransactionState>,
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

  async recharge(dto: RechargeDto): Promise<{wallet: Wallet}> {
    const wallet = await this.repository.findOne( dto.wallet_id );
    if (!wallet) throw new NotFoundException('No se encuentra la billetera')
    // 2) Convertir USD a Becoin
    
    const becoinAmount = +dto.amountUsd / +this.priceOneBecoin;
    // 3) Actualizar saldo
    wallet.becoin_balance = +wallet.becoin_balance + becoinAmount;
    const type = await this.typeRepo.findOneBy({code:'RECHARGE'})
    if (!type) throw new ConflictException ("No se encuentra el tipo 'RECHARGE'")

    const status = await this.stateRepo.findOneBy({code:dto.status})
    if (!status) throw new ConflictException ("No se encuentra el estado" + dto.status)

    const walletUpdated: Wallet = await this.repository.create(wallet);
    
    // 4) Registrar transacción
    await this.txRepo.save({
      wallet_id: wallet.id,
      type_id: type.id,
      status_id: status.id,
      amount: becoinAmount,
      post_balance: wallet.becoin_balance,
      reference: dto.referenceCode,
    });
    return { wallet: walletUpdated };
  }

  async withdraw(walletId: string, dto: WithdrawDto) {
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
    return
  }

  async transfer(wallet_id: string, dto: TransferDto): Promise<{ wallet: Wallet }> {
    const from = await this.repository.findOne( wallet_id );
    if (!from) throw new NotFoundException("No se encuentra la Billetera");
    if (Number(from.becoin_balance) < dto.amountBecoin) throw new BadRequestException('Saldo insuficiente');
    const to = await this.repository.findOne( dto.toWalletId );
    if (!to) throw new NotFoundException('Billetera destino no existe');
    // 1) Debitar origen
    from.becoin_balance = +from.becoin_balance - dto.amountBecoin;

    const type = await this.typeRepo.findOneBy({code:'TRANSFER'})
    if (!type) throw new ConflictException ("No se encuentra el tipo 'TRANSFER'")

    const status = await this.stateRepo.findOneBy({code:'COMPLETED'})
    if (!status) throw new ConflictException ("No se encuentra el estado 'COMPLETED'")

    const walletUpdate = await this.repository.create(from);

    const txFrom = this.txRepo.save({
      wallet_id: from.id,
      type,
      status,
      amount: -dto.amountBecoin,
      post_balance: from.becoin_balance,
      related_wallet_id: to.id,
    });

    // 2) Acreditar destino
    to.becoin_balance = +to.becoin_balance + dto.amountBecoin;
    await this.repository.create(to);
    
    const txTo = this.txRepo.save({
      wallet_id: to.id,
      type,
      status,
      amount: dto.amountBecoin,
      post_balance: to.becoin_balance,
      related_wallet_id: from.id,
    });

    return { wallet: walletUpdate };
  }

}
