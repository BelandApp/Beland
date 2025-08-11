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

@Injectable()
export class OrdersService {
  private readonly completeMessage = 'la orden';

  constructor(
    private readonly repository: OrdersRepository,
    private readonly walletRepo: WalletsRepository,
    private readonly cartRepo: CartsRepository
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

  async createOrderByCart(cart_id: string, wallet_id:string): Promise<Order> {
    const wallet = await this.walletRepo.findOne(wallet_id);
    const cart = await this.cartRepo.findOne(cart_id);
    if (wallet.becoin_balance < cart.total_amount) throw new NotAcceptableException('Saldo Insuficiente')
    
    
    // incluir todo el codigo necesario. inserta cart en order, inserta cartitems en orderItems
    // genera el pago desde la wallet.
    // si no alcanza el fondo da error.
    // si alcanza crea saldos bloqueados a los vendedores. y los notifica para que envien los productos.
    // una vez los productos son recibidos por el usuario. se notifica y se habilita  el pago al vendedor.
    // retorna la orden o un mensage de que todo salio bien.
    return 
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
