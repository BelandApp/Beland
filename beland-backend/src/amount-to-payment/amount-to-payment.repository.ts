import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { AmountToPayment } from './entities/amount-to-payment.entity';

@Injectable()
export class AmountToPaymentsRepository {
  constructor(
    @InjectRepository(AmountToPayment)
    private repository: Repository<AmountToPayment>,
  ) {}

 async findAll(user_commerce_id: string, page: number, limit: number): Promise<[AmountToPayment[], number]> {
     return this.repository.findAndCount({
       where: {user_commerce_id},
       order: { created_at: 'DESC' },
       skip: (page - 1) * limit,
       take: limit,
     });
   }

  async findOne(id: string): Promise<AmountToPayment> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<AmountToPayment>): Promise<AmountToPayment> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<AmountToPayment>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
