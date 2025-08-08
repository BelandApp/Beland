import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartItemsRepository {
  constructor(
    @InjectRepository(CartItem)
    private repository: Repository<CartItem>,
  ) {}

  async findAll(
    cart_id: string,
    page: number,
    limit: number,
  ): Promise<[CartItem[], number]> {
    const where = cart_id ? { cart_id } : {};

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  }

  async findOne(id: string): Promise<CartItem> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(body: Partial<CartItem>): Promise<CartItem> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<CartItem>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
