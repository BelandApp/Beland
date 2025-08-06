import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Prize } from './entities/prize.entity';

@Injectable()
export class PrizesRepository {
  constructor(
    @InjectRepository(Prize)
    private repository: Repository<Prize>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[Prize[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<Prize> {
    return this.repository.findOne({
      where: { id },
      relations: ['redemptions'],
    });
  }

  async create(body: Partial<Prize>): Promise<Prize> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Prize>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
