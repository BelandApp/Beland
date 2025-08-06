import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InventoryItemsRepository } from './inventory-items.repository';
import { InventoryItem } from './entities/inventory-item.entity';

@Injectable()
export class InventoryItemsService {
  private readonly completeMessage = 'el item del inventario';

  constructor(private readonly repository: InventoryItemsRepository) {}

  async findAll(
    product_id: string,
    pageNumber: number,
    limitNumber: number,
  ): Promise<[InventoryItem[], number]> {
    try {
      const response = await this.repository.findAll(
        product_id,
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<InventoryItem> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<InventoryItem>): Promise<InventoryItem> {
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

  async update(id: string, body: Partial<InventoryItem>) {
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
