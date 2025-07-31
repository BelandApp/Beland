import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsRepository {
  constructor(
    @InjectRepository(Coupon)
    private repository: Repository<Coupon>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[Coupon[], number]> {
    const where = user_id ? { redeemed_by_user_id: user_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['redeemed_by_user'],
    });
  }

  async findOne(id: string): Promise<Coupon> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(body: Partial<Coupon>): Promise<Coupon> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Coupon>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
