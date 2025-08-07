import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>,
    @InjectRepository(TransactionState)
    private stateRepository: Repository<TransactionState>,
  ) {}

  async findAll(
    wallet_id: string,
    status_id: string,
    type_id: string,
    page: number,
    limit: number,
  ): Promise<[Transaction[], number]> {
    const where: any = {};

    if (wallet_id) {
        where.wallet_id = wallet_id;
    }

    if (status_id) {
        where.status_id = status_id;
    }

    if (type_id) {
        where.type_id = type_id;
    }

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['status', 'type'],
    });
  }

  async findOne(id: string): Promise<Transaction> {
    return this.repository.findOne({
      where: { id },
      relations: ['status', 'type'],
    });
  }

  async create(body: Partial<Transaction>): Promise<Transaction> {
    const state = await this.stateRepository.findOneBy({code: 'PENDING'})
    if (!state) throw new ConflictException ("No se encuentra el estado para 'PENDING'"); 
    return await this.repository.save({...body, status_id: state.id});
  }

  async update(id: string, body: Partial<Transaction>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
