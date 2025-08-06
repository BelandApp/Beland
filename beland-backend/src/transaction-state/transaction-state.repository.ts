import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { TransactionState } from './entities/transaction-state.entity';

@Injectable()
export class TransactionStatesRepository {
  constructor(
    @InjectRepository(TransactionState)
    private repository: Repository<TransactionState>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[TransactionState[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<TransactionState> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<TransactionState>): Promise<TransactionState> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<TransactionState>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
