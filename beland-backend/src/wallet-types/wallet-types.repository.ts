import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { WalletType } from './entities/wallet-type.entity';

@Injectable()
export class WalletTypesRepository {
  constructor(
    @InjectRepository(WalletType)
    private repository: Repository<WalletType>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[WalletType[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<WalletType> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<WalletType>): Promise<WalletType> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<WalletType>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
