import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Action } from './entities/action.entity';

@Injectable()
export class ActionsRepository {
  constructor(
    @InjectRepository(Action)
    private repository: Repository<Action>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[Action[], number]> {
    const where = user_id ? { user_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Action> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(body: Partial<Action>): Promise<Action> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Action>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
