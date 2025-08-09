import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { RecyclePrice } from './entities/recycle_price.entity';

@Injectable()
export class RecyclePricesRepository {
  constructor(
    @InjectRepository(RecyclePrice)
    private repository: Repository<RecyclePrice>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[RecyclePrice[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<RecyclePrice> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(body: Partial<RecyclePrice>): Promise<RecyclePrice> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<RecyclePrice>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
