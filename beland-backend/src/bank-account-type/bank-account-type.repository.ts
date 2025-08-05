import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { BankAccountType } from './entities/bank-account-type.entity';

@Injectable()
export class BankAccountTypesRepository {
  constructor(
    @InjectRepository(BankAccountType)
    private repository: Repository<BankAccountType>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[BankAccountType[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<BankAccountType> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<BankAccountType>): Promise<BankAccountType> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<BankAccountType>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
