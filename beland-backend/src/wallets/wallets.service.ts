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
import { DataSource, Repository } from 'typeorm';
import { RechargeDto } from './dto/recharge.dto';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransferDto } from './dto/transfer.dto';
import { WithdrawDto, WithdrawResponseDto } from './dto/withdraw.dto';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { SuperadminConfigService } from 'src/superadmin-config/superadmin-config.service';
import { UserWithdraw } from 'src/user-withdraw/entities/user-withdraw.entity';

@Injectable()
export class WalletsService {
  private readonly completeMessage = 'la billetera virtual';

  constructor(
    private readonly repository: WalletsRepository,
    private readonly superadminConfig: SuperadminConfigService,
    private readonly dataSource: DataSource, // 👈 acá lo inyectás
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

  async recharge(
    user_id: string,
    dto: RechargeDto,
  ): Promise<{ wallet: Wallet }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) Certificar que exista la wallet
      const wallet = await queryRunner.manager.findOne(Wallet, { where: { user_id } });
      if (!wallet) throw new NotFoundException('No se encuentra la billetera');

      // 2) Certificar que exista el tipo de transacción 'RECHARGE'
      const type = await queryRunner.manager.findOne(TransactionType, { where: { code: 'RECHARGE' } });
      if (!type) throw new ConflictException("No se encuentra el tipo 'RECHARGE'");

      // 3) Certificar que exista el estado 'COMPLETED'
      const status = await queryRunner.manager.findOne(TransactionState, { where: { code: 'COMPLETED' } });
      if (!status) throw new ConflictException("No se encuentra el estado 'COMPLETED'");

      // 4) Convertir USD a Becoin
      const becoinAmount = +dto.amountUsd / +this.superadminConfig.getPriceOneBecoin;

      // 5) Actualizar saldo de la wallet
      wallet.becoin_balance = +wallet.becoin_balance + becoinAmount;
      const walletUpdated = await queryRunner.manager.save(wallet);

      // 6) Registrar la transacción
      await queryRunner.manager.save(Transaction, {
        wallet_id: wallet.id,
        type,
        status,
        amount: dto.amountUsd,
        amount_beicon: becoinAmount,
        post_balance: wallet.becoin_balance,
        reference: dto.referenceCode,
        payphone_transactionId: dto.payphone_transactionId?.toString(),
        clientTransactionId: dto.clientTransactionId,
      });

      // ✅ Confirmar la transacción
      await queryRunner.commitTransaction();

      // 7) Retornar la wallet actualizada
      return { wallet: walletUpdated };
    } catch (error) {
      // ❌ Deshacer todo si algo falla
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Cerrar el queryRunner
      await queryRunner.release();
    }
  }

  async withdraw(
    user_id: string,
    dto: WithdrawDto,
  ): Promise<{ wallet: Wallet }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) Buscar la wallet del usuario
      const wallet = await queryRunner.manager.findOne(Wallet, { where: { user_id } });
      if (!wallet) throw new NotFoundException('No se encuentra la billetera');

      // 2) Verificar saldo suficiente
      if (+wallet.becoin_balance < dto.amountBecoin)
        throw new BadRequestException('Saldo insuficiente');

      // 3) Obtener tipo de transacción 'WITHDRAW'
      const type = await queryRunner.manager.findOne(TransactionType, { where: { code: 'WITHDRAW' } });
      if (!type) throw new ConflictException("No se encuentra el tipo 'WITHDRAW'");

      // 4) Obtener estado 'PENDING'
      const status = await queryRunner.manager.findOne(TransactionState, { where: { code: 'PENDING' } });
      if (!status) throw new ConflictException("No se encuentra el estado 'PENDING'");

      // 5) Reservar fondos: debitar del saldo disponible y aumentar el saldo bloqueado
      wallet.becoin_balance = +wallet.becoin_balance - dto.amountBecoin;
      wallet.locked_balance = (wallet.locked_balance ?? 0) + dto.amountBecoin;
      const walletUpdated = await queryRunner.manager.save(wallet);

      // 6) Registrar la transacción
      const tx = await queryRunner.manager.save(Transaction, {
        wallet_id: wallet.id,
        type,
        status,
        amount: -dto.amountBecoin,
        post_balance: wallet.becoin_balance,
      });

      // 7) Registrar la solicitud de retiro del usuario
      await queryRunner.manager.save(UserWithdraw, {
        user_id,
        wallet_id: wallet.id,
        withdraw_account_id: dto.withdraw_account_id,
        amount_becoin: dto.amountBecoin,
        amount_usd: dto.amountBecoin * this.superadminConfig.getPriceOneBecoin(),
        status_id: status.id,
        transaction_id: tx.id,
      });

      // ✅ Confirmo la transacción
      await queryRunner.commitTransaction();

      // 8) Retornar la wallet actualizada
      return { wallet: walletUpdated };
    } catch (error) {
      // ❌ Deshago todo si algo falla
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Cierro el queryRunner
      await queryRunner.release();
    }
  }

  async withdrawFailed (dto: WithdrawResponseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const {user_withdraw_id, observation, reference} = dto;
    try {
      // 0) Buscar el retiro del usuario
      const userWithdraw = await queryRunner.manager.findOne(UserWithdraw, { where: { id: user_withdraw_id } });
      if (!userWithdraw) throw new NotFoundException('No se encuentra el retiro del usuario');
      
      // 1) Buscar la wallet del usuario
      const wallet = await queryRunner.manager.findOne(Wallet, { where: { user_id: userWithdraw.user_id } });
      if (!wallet) throw new NotFoundException('No se encuentra la billetera');

      // 2) Busco el registro de la transacción
      const transaction = await queryRunner.manager.findOne(Transaction, { where: { id: userWithdraw.transaction_id } });
      if (!transaction) throw new ConflictException("No se encuentra la transaccion del retiro");

      // 3) Obtener estado 'FAILED'
      const status = await queryRunner.manager.findOne(TransactionState, { where: { code: 'FAILED' } });
      if (!status) throw new ConflictException("No se encuentra el estado 'FAILED'");

      // 4) Regresar fondos: acreditar el saldo y descontar del saldo bloqueado
      wallet.becoin_balance = +wallet.becoin_balance + +userWithdraw.amount_becoin;
      wallet.locked_balance = +wallet.locked_balance - +userWithdraw.amount_becoin;
      const walletUpdated = await queryRunner.manager.save(wallet);

      // 5) actualizo la transacción a estado FAILED
      transaction.status_id = status.id;
      transaction.reference = reference;
      await queryRunner.manager.save(transaction);

      // 6) actualizo el retiro de usuario a estado FAILED
      userWithdraw.status_id= status.id;
      userWithdraw.observation= observation ?? '';
      await queryRunner.manager.save(userWithdraw);
    
      // ✅ Confirmo la transacción
      await queryRunner.commitTransaction();

      // 7) Retornar la wallet actualizada
      return { wallet: walletUpdated };
    } catch (error) {
      // ❌ Deshago todo si algo falla
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Cierro el queryRunner
      await queryRunner.release();
    }
  }

  async withdrawCompleted (dto: WithdrawResponseDto ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const {user_withdraw_id, observation, reference} = dto;
    try {
      // 0) Buscar el retiro del usuario
      const userWithdraw = await queryRunner.manager.findOne(UserWithdraw, { where: { id: user_withdraw_id } });
      if (!userWithdraw) throw new NotFoundException('No se encuentra el retiro del usuario');
      
      // 1) Buscar la wallet del usuario
      const userWallet = await queryRunner.manager.findOne(Wallet, { where: { user_id: userWithdraw.user_id } });
      if (!userWallet) throw new NotFoundException('No se encuentra la billetera del usuario');

      // 1 Bis) Buscar la wallet del superAdmin
      const adminWallet = await queryRunner.manager.findOne(Wallet, { where: { user_id: this.superadminConfig.getWalletId() } });
      if (!adminWallet) throw new NotFoundException('No se encuentra la billetera Beland');

      // 2) Busco el registro de la transacción
      const transaction = await queryRunner.manager.findOne(Transaction, { where: { id: userWithdraw.transaction_id } });
      if (!transaction) throw new ConflictException("No se encuentra la transaccion del retiro");

      // 3) Obtener estado 'COMPLETED'
      const status = await queryRunner.manager.findOne(TransactionState, { where: { code: 'COMPLETED' } });
      if (!status) throw new ConflictException("No se encuentra el estado 'COMPLETED'");

      // 4) Descuento Definitivo: Descontar del saldo bloqueado
      userWallet.locked_balance = +userWallet.locked_balance - +userWithdraw.amount_becoin;
      await queryRunner.manager.save(userWallet);

      // 5) actualizo la transacción a estado COMPLETED
      transaction.status_id = status.id;
      await queryRunner.manager.save(transaction);

      // 6) actualizo el retiro de usuario a estado COMPLETED
      userWithdraw.status_id= status.id;
      userWithdraw.observation= observation ?? '';
      await queryRunner.manager.save(userWithdraw);
    
      // 7) actualizo la billetera del superAdmin 
      adminWallet.becoin_balance = +adminWallet.becoin_balance + +userWithdraw.amount_becoin;
      const adminWalletUpdated = await queryRunner.manager.save(adminWallet);

      // 3) Obtener tipo de transacción 'USER_WITHDRAW_IN'
      const type = await queryRunner.manager.findOne(TransactionType, { where: { code: 'WITHDRAW_IN' } });
      if (!type) throw new ConflictException("No se encuentra el tipo 'WITHDRAW_IN'");
    
      // 8) Genero una transaccion para la wallet del super admin 
      const tx = await queryRunner.manager.save(Transaction, {
        wallet_id: adminWallet.id,
        type,
        status,
        amount: +userWithdraw.amount_becoin,
        post_balance: adminWallet.becoin_balance,
        reference,
      });


      // ✅ Confirmo la transacción
      await queryRunner.commitTransaction();

      // 9) Retornar la wallet actualizada
      return { wallet: adminWalletUpdated };
    } catch (error) {
      // ❌ Deshago todo si algo falla
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Cierro el queryRunner
      await queryRunner.release();
    }
  }

  async transfer(
    user_id: string,
    dto: TransferDto,
    code_transaction_send = 'TRANSFER_SEND',
    code_transaction_received = 'TRANSFER_RECEIVED',
  ): Promise<{ wallet: Wallet }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) certifico que exista la wallet origen y que tenga los fondos
      const from = await queryRunner.manager.findOne(Wallet, { where: { user_id } });
      if (!from) throw new NotFoundException('No se encuentra la Billetera');
      if (Number(from.becoin_balance) < dto.amountBecoin)
        throw new BadRequestException('Saldo insuficiente');

      // 2) certifico que exista la wallet de destino
      const to = await queryRunner.manager.findOne(Wallet, { where: { id: dto.toWalletId } });
      if (!to) throw new NotFoundException('Billetera destino no existe');

      // 3) chequeo que exista el estado y el tipo de transaccion necesarios
      let type = await queryRunner.manager.findOne(TransactionType, { where: { code: code_transaction_send } });
      if (!type) throw new ConflictException(`No se encuentra el tipo ${code_transaction_send}`);

      const status = await queryRunner.manager.findOne(TransactionState, { where: { code: 'COMPLETED' } });
      if (!status) throw new ConflictException("No se encuentra el estado 'COMPLETED'");

      // 4) Debitar origen
      from.becoin_balance = +from.becoin_balance - dto.amountBecoin;
      const walletUpdate = await queryRunner.manager.save(from);

      // 5) registro egreso del origen
      await queryRunner.manager.save(Transaction, {
        wallet_id: from.id,
        type,
        status,
        amount: -dto.amountBecoin,
        post_balance: from.becoin_balance,
        related_wallet_id: to.id,
        reference: `${code_transaction_send}-${dto.toWalletId}`,
      });

      // 6) Chequeo que exista el tipo de transaccion necesario
      type = await queryRunner.manager.findOne(TransactionType, { where: { code: code_transaction_received } });
      if (!type) throw new ConflictException(`No se encuentra el tipo ${code_transaction_received}`);

      // 7) Acreditar destino
      to.becoin_balance = +to.becoin_balance + dto.amountBecoin;
      await queryRunner.manager.save(to);

      // 8) registro ingreso del destino
      await queryRunner.manager.save(Transaction, {
        wallet_id: to.id,
        type,
        status,
        amount: dto.amountBecoin,
        post_balance: to.becoin_balance,
        related_wallet_id: from.id,
        reference: `${code_transaction_received}-${from.id}`,
      });

      // ✅ Confirmo la transacción
      await queryRunner.commitTransaction();
      return { wallet: walletUpdate };

    } catch (error) {
      // ❌ Deshago todo si algo falla
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Cierro el queryRunner
      await queryRunner.release();
    }
  }

  async purchaseBeland(
    wallet_id: string,
    becoinAmount: number,
    referenceCode: string,
  ) {
    const wallet = await this.repository.findOne(wallet_id);
    if (!wallet) throw new NotFoundException('No se encuentra la billetera');

    // 3) Actualizar saldo
    if (+wallet.becoin_balance < becoinAmount)
      throw new ConflictException('Saldo insuficiente');

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
