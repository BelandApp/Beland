import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { Order } from './entities/order.entity';
import { WalletsRepository } from 'src/wallets/wallets.repository';
import { CartsRepository } from 'src/cart/cart.repository';
import { OrderItemsRepository } from 'src/order-items/order-items.repository';
import { CreateOrderByCartDto } from './dto/create-order-cart.dto';
import { PaymentTypesRepository } from 'src/payment-types/payment-types.repository';

@Injectable()
export class OrdersService {
  private readonly completeMessage = 'la orden';

  constructor(
    private readonly repository: OrdersRepository,
    private readonly orderItemRepo: OrderItemsRepository,
    private readonly walletRepo: WalletsRepository,
    private readonly cartRepo: CartsRepository, 
    private readonly payTypeRepo: PaymentTypesRepository, 

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
    const wallet = await this.walletRepo.findOne(order_create.wallet_id);
    const cart = await this.cartRepo.findOne(order_create.cart_id);
    if (!wallet) throw new NotFoundException('Wallet no encontrada');
    if (!cart) throw new NotFoundException('Carrito no encontrado');

    if (wallet.becoin_balance < cart.total_amount) {
      throw new NotAcceptableException('Saldo insuficiente');
    }

    // Crear la orden
    const { id, user_id, created_at, updated_at, items, ...createOrder } = cart;
    const order = await this.repository.create({
      ...createOrder,
      leader_id: user_id,
    });

    const savedOrder = await this.repository.create(order);
    if (!savedOrder) throw new ConflictException('No se pudo crear la orden');

    // Preparar los ítems para insertar
    const orderItems = cart.items.map(({ id, created_at, cart_id, ...rest }) => ({
      ...rest,
      order_id: savedOrder.id,
    }));

    // Inserción masiva de ítems
    const itemsCreated = await this.orderItemRepo.createMany(orderItems);
    if (!itemsCreated) throw new ConflictException('No se pudiero crear los items asociados a la orden');

    const paymentType = await this.payTypeRepo.findOne(savedOrder.payment_type_id)
    if (!paymentType) throw new ConflictException('La forma de Pago no se puede usar por el momento');

    if (paymentType.code == 'FULL') {
      
    } else { 

    }
    
    
    return savedOrder;
  }

  async update(id: string, body: Partial<Order>) {
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
}
