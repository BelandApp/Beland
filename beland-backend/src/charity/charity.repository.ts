import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Charity } from './entities/charity.entity';

@Injectable()
export class CharitiesRepository {
  constructor(
    @InjectRepository(Charity)
    private repository: Repository<Charity>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[Charity[], number]> {
    const where = user_id ? { user_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Charity> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(body: Partial<Charity>): Promise<Charity> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Charity>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
