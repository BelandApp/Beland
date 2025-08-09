import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';

@Injectable()
export class InventoryItemsRepository {
  constructor(
    @InjectRepository(InventoryItem)
    private repository: Repository<InventoryItem>,
  ) {}

  async findAll(
    product_id: string,
    page: number,
    limit: number,
  ): Promise<[InventoryItem[], number]> {
    const where = product_id ? { product_id } : {};

    return this.repository.findAndCount({
        where,
        order: { updated_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['product'],
    });
  }

  async findOne(id: string): Promise<InventoryItem> {
    return this.repository.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async create(body: Partial<InventoryItem>): Promise<InventoryItem> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<InventoryItem>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
