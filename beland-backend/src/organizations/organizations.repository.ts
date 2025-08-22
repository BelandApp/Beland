import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsRepository {
  constructor(
    @InjectRepository(Organization)
    private repository: Repository<Organization>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[Organization[], number]> {
    const where = user_id ? { user_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Organization> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(body: Partial<Organization>): Promise<Organization> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Organization>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
