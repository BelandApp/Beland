import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserResource } from './entities/user-resource.entity';

@Injectable()
export class UserResourcesRepository {
  constructor(
    @InjectRepository(UserResource)
    private repository: Repository<UserResource>,
  ) {}

  async findAll(
    user_id: string,
    resource_id:string,
    page: number,
    limit: number,
  ): Promise<[UserResource[], number]> {
    let where: any;
    if (user_id) {
      where.user_id = user_id;
    }

    if (resource_id) {
      where.resource_id = resource_id;
    }

    return this.repository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: {resource:true}
    });
  } 

  async getTotalAvailable(resource_id: string): Promise<{ total_available: number }> {
    const userResources = await this.repository.find({
      where: { resource_id, is_redeemed: false, expires_at: null },
    });

    if (!userResources || userResources.length === 0) {
    // Lanzar NotFoundException para cumplir con la documentación
      throw new NotFoundException(`No se encontró el recurso con id ${resource_id}`);
    }

    const totalAvailable = userResources.reduce((sum, ur) => {
      const remaining = ur.quantity - (ur.quantity_redeemed || 0);
      return sum + remaining;
    }, 0);

    return { total_available: totalAvailable };
  }

  async getRemainingByHash(hash_id: string, user_id: string): Promise<{ remaining: number }> {
    const userResource = await this.repository.findOne({
      where: { hash_id, user_id, is_redeemed: false },
    });

    if (!userResource) {
      throw new NotFoundException(`No se encontró el recurso de usuario con hash_id ${hash_id}`);
    }

    const remaining = userResource.quantity - (userResource.quantity_redeemed || 0);
    return { remaining };
  }


  async findOne(id: string): Promise<UserResource> {
    return this.repository.findOne({
      where: { id },
      relations: {resource:true}
    });
  }

  async findByUserHash(hash_id: string, user_id: string): Promise<UserResource> {
    return this.repository.findOne({
      where: { hash_id, user_id }
    });
  }

  async create(body: Partial<UserResource>): Promise<UserResource> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<UserResource>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }
}
