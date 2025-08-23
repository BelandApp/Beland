import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PresetAmount } from './entities/preset-amount.entity';

@Injectable()
export class PresetAmountsRepository {
  constructor(
    @InjectRepository(PresetAmount)
    private repository: Repository<PresetAmount>,
  ) {}

 async findAll(user_commerce_id: string, page: number, limit: number): Promise<[PresetAmount[], number]> {
     return this.repository.findAndCount({
       where: {user_commerce_id},
       order: { created_at: 'DESC' },
       skip: (page - 1) * limit,
       take: limit,
     });
   }

  async findOne(id: string): Promise<PresetAmount> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async create(body: Partial<PresetAmount>): Promise<PresetAmount> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<PresetAmount>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
