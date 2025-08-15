import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { GroupType } from './entities/group-type.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class GroupTypeRepository {
  constructor(
    @InjectRepository(GroupType)
    private repository: Repository<GroupType>,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<[GroupType[], number]> {

    return this.repository.findAndCount({
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<GroupType> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<GroupType>): Promise<GroupType> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<GroupType>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }

  async getProductsByGroupType(groupTypeId: string): Promise<Product[]> {

    const groupType = await this.repository.findOne({
        where: { id: groupTypeId },
        relations: ['products'],
    });

    if (!groupType) throw new Error('GroupType no encontrado');

    return groupType.products;
    }
}
