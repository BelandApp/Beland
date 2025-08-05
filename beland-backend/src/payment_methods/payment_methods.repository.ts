import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PaymentMethod } from './entities/payment_method.entity';

@Injectable()
export class PaymentMethodsRepository {
  constructor(
    @InjectRepository(PaymentMethod)
    private repository: Repository<PaymentMethod>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[PaymentMethod[], number]> {
    const where = user_id ? { user_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['user'],
    });
  }

  async findOne(id: string): Promise<PaymentMethod> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(body: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<PaymentMethod>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
