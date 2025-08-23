import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { Order } from './entities/order.entity';
import { CreateOrderByCartDto } from './dto/create-order-cart.dto';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { PaymentType } from 'src/payment-types/entities/payment-type.entity';
import { DataSource } from 'typeorm';
import { CartItem } from 'src/cart-items/entities/cart-item.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';

@Injectable()
export class OrdersService {
  private readonly completeMessage = 'la orden';

  constructor(
    private readonly repository: OrdersRepository,
    private readonly dataSource: DataSource

  ) {}

  async findAll(
    leader_id: string,
    pageNumber: number,
    limitNumber: number,
  ): Promise<[Order[], number]> {
    try {
      const response = await this.repository.findAll(
        leader_id,
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<Order> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<Order>): Promise<Order> {
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

  async createOrderByCart(order_create: CreateOrderByCartDto): Promise<Order> {
    // 0) Preparar transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // opcional: pasar aislamiento

    try {
      // 1) Traer y bloquear la wallet (evita condiciones de carrera al descontar saldo)
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: order_create.wallet_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Wallet no encontrada');

      // 2) Traer y bloquear el carrito con sus ítems
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { id: order_create.cart_id },
        relations: ['items'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!cart) throw new NotFoundException('Carrito no encontrado');
      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('El carrito no tiene ítems');
      }

      // (opcional recomendado) Validar que el carrito pertenezca al mismo usuario de la wallet
      // if (cart.user_id !== wallet.user_id) throw new BadRequestException('Carrito no pertenece al usuario de la wallet');

      // 3) Validar forma de pago
      const paymentType = await queryRunner.manager.findOne(PaymentType, {
        where: { id: cart.payment_type_id },
      });
      if (!paymentType) {
        throw new ConflictException('Forma de pago no disponible. Pruebe otra o intente luego.');
      }
      if (paymentType.code !== 'FULL') {
        throw new BadRequestException('Por el momento solo está disponible la forma de pago -FULL-');
      }

      // 4) Validar saldo suficiente (y normalizar a número)
      const cartTotal = Number(cart.total_amount);
      const currentBalance = Number(wallet.becoin_balance);
      if (currentBalance < cartTotal) {
        throw new NotAcceptableException('Saldo insuficiente. Recarga primero tu Billetera');
      }

      // 5) Descontar saldo y guardar wallet
      wallet.becoin_balance = currentBalance - cartTotal;
      await queryRunner.manager.save(Wallet, wallet);

      // 6) Crear la orden desde el carrito (copiando campos necesarios)
      //    - Tomamos algunos campos del carrito y seteamos leader_id = user_id
      const { id: _cartId, user_id, created_at: _c1, updated_at: _c2, items: _items, ...createOrder } = cart as any;
      const order = queryRunner.manager.create(Order, {
        ...createOrder,
        status: 'PAID',
        leader_id: user_id,
        total_amount: cartTotal, // aseguramos consistencia con el total del carrito
      });
      const savedOrder = await queryRunner.manager.save(Order, order);
      if (!savedOrder) {
        throw new ConflictException('No se pudo crear la orden');
      }

      // 7) Crear ítems de la orden a partir de los ítems del carrito
      const orderItemsPayload = (cart.items as CartItem[]).map(({ id, created_at, cart_id, ...rest }) => ({
        ...rest,
        order_id: savedOrder.id,
      }));

      const orderItems = queryRunner.manager.create(OrderItem, orderItemsPayload);
      const itemsCreated = await queryRunner.manager.save(OrderItem, orderItems);
      if (!itemsCreated || itemsCreated.length === 0) {
        throw new ConflictException('No se pudieron crear los ítems asociados a la orden');
      }

      // 8) Traer tipo y estado de transacción (correcto: TransactionType y TransactionState)
      const txType = await queryRunner.manager.findOne(TransactionType, {
        where: { code: 'PURCHASE_BELAND' },
      });
      if (!txType) throw new ConflictException("No se encuentra el tipo 'PURCHASE_BELAND'");

      const txState = await queryRunner.manager.findOne(TransactionState, {
        where: { code: 'COMPLETED' },
      });
      if (!txState) throw new ConflictException("No se encuentra el estado 'COMPLETED'");

      // 9) Registrar transacción (post_balance debe reflejar el saldo luego del descuento)
      const tx = queryRunner.manager.create(Transaction, {
        wallet_id: wallet.id,
        type_id: txType.id,
        status_id: txState.id,
        amount: cartTotal,
        post_balance: wallet.becoin_balance,
        reference: `PURCHASEBELAND-${savedOrder.id}`,
      });
      const txSaved = await queryRunner.manager.save(Transaction, tx);

      // 9 Bis) aca deberia incrementar el saldo del wallet SuperAdmin, registrar tambien la transaccion, y generar una nueva tabla para enviar los pedidos para generar el envio.


      // 10) Registrar pago de la orden
      const payment = queryRunner.manager.create(Payment, {
        amount_paid: savedOrder.total_amount,
        order_id: savedOrder.id,
        payment_type_id: savedOrder.payment_type_id,
        user_id: savedOrder.leader_id,
        transaction_id: txSaved.id,
      });
      await queryRunner.manager.save(Payment, payment);

      // 11) Resetear el carrito
      // Eliminamos todos los CartItem
      if (cart.items && cart.items.length > 0) {
        const itemIds = cart.items.map(item => item.id);
        await queryRunner.manager.delete(CartItem, itemIds);
      }

      // Reiniciamos totales
      cart.total_amount = 0;
      cart.total_items = 0;
      await queryRunner.manager.save(Cart, cart);

      // 12) Confirmar transacción
      await queryRunner.commitTransaction();

      // 13) Devolver la orden creada (podés cargar relaciones si querés)
      return savedOrder;
    } catch (err) {
      // Revertir todo si falla algo
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Liberar recursos
      await queryRunner.release();
    }
  }
}
