import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { TransactionType } from './entities/transaction-type.entity';

@Injectable()
export class TransactionTypesRepository {
  constructor(
    @InjectRepository(TransactionType)
    private repository: Repository<TransactionType>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[TransactionType[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<TransactionType> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<TransactionType>): Promise<TransactionType> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<TransactionType>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
