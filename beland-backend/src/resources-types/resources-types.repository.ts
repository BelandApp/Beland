import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ResourcesType } from './entities/resources-type.entity';

@Injectable()
export class ResourcesTypesRepository {
  constructor(
    @InjectRepository(ResourcesType)
    private repository: Repository<ResourcesType>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[ResourcesType[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<ResourcesType> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<ResourcesType>): Promise<ResourcesType> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<ResourcesType>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
