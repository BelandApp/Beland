import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AmountToPayment } from './entities/amount-to-payment.entity';
import { AmountToPaymentsRepository } from './amount-to-payment.repository';

@Injectable()
export class AmountToPaymentsService {
  private readonly completeMessage = 'el monto a pagar';

  constructor(private readonly repository: AmountToPaymentsRepository) {}

  async findAll(
      user_commerce_id: string,
      pageNumber: number,
      limitNumber: number,
    ): Promise<[AmountToPayment[], number]> {
      try {
        const response = await this.repository.findAll(
          user_commerce_id,
          pageNumber,
          limitNumber,
        );
        return response;
      } catch (error) {
        throw new InternalServerErrorException(error);
      }
    }

  async findOne(id: string): Promise<AmountToPayment> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<AmountToPayment>): Promise<AmountToPayment> {
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

  async update(id: string, body: Partial<AmountToPayment>) {
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
