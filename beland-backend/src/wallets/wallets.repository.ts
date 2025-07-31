import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletsRepository {
  constructor(
    @InjectRepository(Wallet)
    private repository: Repository<Wallet>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[Wallet[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['user'],
    });
  } 

  async findByUserId(user_id: string): Promise<Wallet> {
    return this.repository.findOne({
      where: { user_id },
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Wallet> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(body: Partial<Wallet>): Promise<Wallet> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Wallet>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
