import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private repository: Repository<Payment>,
  ) {}

  async findAll(
    group_id: string, 
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[Payment[], number]> {
    
    const where: any = { user_id };
    if (group_id) {
      where.group_id = group_id;
    }

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['group', 'user'],
    });
  }

  async findOne(id: string): Promise<Payment> {
    return this.repository.findOne({
      where: { id },
      relations: ['group', 'user'],
    });
  }

  async create(body: Partial<Payment>): Promise<Payment> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Payment>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
