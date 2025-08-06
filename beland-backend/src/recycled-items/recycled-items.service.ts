import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RecycledItemsRepository } from './recycled-items.repository';
import { RecycledItem } from './entities/recycled-item.entity';

@Injectable()
export class RecycledItemsService {
  private readonly completeMessage = 'el producto reciclado';

  constructor(private readonly repository: RecycledItemsRepository) {}

  async findAll(
    product_id: string, 
    user_id: string,
    pageNumber: number,
    limitNumber: number,
  ): Promise<[RecycledItem[], number]> {
    try {
      const response = await this.repository.findAll(
        product_id,
        user_id,
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<RecycledItem> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<RecycledItem>): Promise<RecycledItem> {
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

  async update(id: string, body: Partial<RecycledItem>) {
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
