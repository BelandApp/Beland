import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Merchant } from './entities/merchant.entity';

@Injectable()
export class MerchantsRepository {
  constructor(
    @InjectRepository(Merchant)
    private repository: Repository<Merchant>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[Merchant[], number]> {
    const where = user_id ? { user_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Merchant> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(body: Partial<Merchant>): Promise<Merchant> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Merchant>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
