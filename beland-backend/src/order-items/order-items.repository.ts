import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderItemsRepository {
  constructor(
    @InjectRepository(OrderItem)
    private repository: Repository<OrderItem>,
  ) {}

  async findAll(
    order_id: string,
    page: number,
    limit: number,
  ): Promise<[OrderItem[], number]> {
    const where = order_id ? { order_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['order', 'product', 'consumed_by_user'],
    });
  }

  async findOne(id: string): Promise<OrderItem> {
    return this.repository.findOne({
      where: { id },
      relations: ['order', 'product', 'consumed_by_user'],
    });
  }

  async create(body: Partial<OrderItem>): Promise<OrderItem> {
    return await this.repository.save(body);
  }

  async createMany(items: Partial<OrderItem>[]) {
    return await this.repository.save(items);
  }

  async update(id: string, body: Partial<OrderItem>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
