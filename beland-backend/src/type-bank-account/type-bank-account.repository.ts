import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { TypeBankAccount } from './entities/type-bank-account.entity';

@Injectable()
export class TypeBankAccountsRepository {
  constructor(
    @InjectRepository(TypeBankAccount)
    private repository: Repository<TypeBankAccount>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[TypeBankAccount[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<TypeBankAccount> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(body: Partial<TypeBankAccount>): Promise<TypeBankAccount> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<TypeBankAccount>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
