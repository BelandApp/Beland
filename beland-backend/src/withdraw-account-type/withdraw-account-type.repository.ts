import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { WithdrawAccountType } from './entities/withdraw-account-type.entity';

@Injectable()
export class WithdrawAccountTypesRepository {
  constructor(
    @InjectRepository(WithdrawAccountType)
    private repository: Repository<WithdrawAccountType>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[WithdrawAccountType[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<WithdrawAccountType> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<WithdrawAccountType>): Promise<WithdrawAccountType> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<WithdrawAccountType>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
