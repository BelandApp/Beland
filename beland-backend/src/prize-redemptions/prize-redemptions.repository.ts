import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PrizeRedemption } from './entities/prize-redemption.entity';

@Injectable()
export class PrizeRedemptionsRepository {
  constructor(
    @InjectRepository(PrizeRedemption)
    private repository: Repository<PrizeRedemption>,
  ) {}

  async findAll(
    prize_id: string, 
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[PrizeRedemption[], number]> {
    let where: Object; 
    if (prize_id) {
        where = {prize_id} 
    } else {
        where = user_id ? {user_id} : {};
    }

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['prize', 'user'],
    });
  }

  async findOne(id: string): Promise<PrizeRedemption> {
    return this.repository.findOne({
      where: { id },
      relations: ['prize', 'user'],
    });
  }

  async create(body: Partial<PrizeRedemption>): Promise<PrizeRedemption> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<PrizeRedemption>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
