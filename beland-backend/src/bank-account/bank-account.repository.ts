import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';

@Injectable()
export class BankAccountsRepository {
  constructor(
    @InjectRepository(BankAccount)
    private repository: Repository<BankAccount>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[BankAccount[], number]> {
    const where = user_id ? { user_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['user','account_type'],
    });
  }

  async findOne(id: string): Promise<BankAccount> {
    return this.repository.findOne({
      where: { id },
      relations: ['user','account_type'],
    });
  }

  async create(body: Partial<BankAccount>): Promise<BankAccount> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<BankAccount>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
