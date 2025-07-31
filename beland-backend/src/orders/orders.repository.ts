import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private repository: Repository<Order>,
  ) {}

  async findAll(
    leader_id: string,
    page: number,
    limit: number,
  ): Promise<[Order[], number]> {
    const where = leader_id ? { leader_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['group', 'leader'],
    });
  }

  async findOne(id: string): Promise<Order> {
    return this.repository.findOne({
      where: { id },
      relations: ['group', 'leader', 'payments', 'items'],
    });
  }

  async create(body: Partial<Order>): Promise<Order> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Order>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
