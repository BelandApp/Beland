import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';

@Injectable()
export class GroupMembersRepository {
  constructor(
    @InjectRepository(GroupMember)
    private repository: Repository<GroupMember>,
  ) {}

  async findAll(
    group_id: string,
    page: number,
    limit: number,
  ): Promise<[GroupMember[], number]> {
    const where = group_id ? {group_id} : {}; 

    return this.repository.findAndCount({
        where,
        order: { joined_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['group', 'user'],
    });
  }

  async findOne(id: string): Promise<GroupMember> {
    return this.repository.findOne({
      where: { id },
      relations: ['group', 'user'],
    });
  }

  async create(body: Partial<GroupMember>): Promise<GroupMember> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<GroupMember>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
