import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartsRepository {
  constructor(
    @InjectRepository(Cart)
    private repository: Repository<Cart>,
  ) {}

  async findByUser(user_id: string): Promise<Cart> {
    return this.repository.findOne({
      where: { user_id },
    });
  }

  async findOne(id: string): Promise<Cart> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(body: Partial<Cart>): Promise<Cart> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<Cart>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
