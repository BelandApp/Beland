import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsRepository {
  constructor(
    @InjectRepository(Group)
    private repository: Repository<Group>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[Group[], number]> {
    const where = user_id ? { leader_id: user_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['loader', 'members'],
    });
  }

  async findOne(id: string): Promise<Group> {
    return this.repository.findOne({
      where: { id },
      relations: ['loader', 'members'],
    });
  }

  async create(body: Partial<Group>): Promise<Group> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Group>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
