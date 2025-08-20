import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Resource } from './entities/resource.entity';

@Injectable()
export class ResourcesRepository {
  constructor(
    @InjectRepository(Resource)
    private repository: Repository<Resource>,
  ) {}

  async findAll(
    resource_type_id:string,
    page: number,
    limit: number,
  ): Promise<[Resource[], number]> {
    const where: any = {
      is_expired: false, // siempre filtra por no expirado
    };

    if (resource_type_id) {
      where.resource_type_id = resource_type_id;
    }

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: {resource_type:true}
    });
  }

  async findOne(id: string): Promise<Resource> {
    return this.repository.findOne({
      where: { id },
      relations: {resource_type:true}
    });
  }

  async create(body: Partial<Resource>): Promise<Resource> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Resource>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
