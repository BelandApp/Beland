import { Injectable } from '@nestjs/common';
import { DataSource, Repository, DeleteResult } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { User } from '../users/entities/users.entity';

@Injectable()
export class AdminRepository extends Repository<Admin> {
  constructor(private dataSource: DataSource) {
    super(Admin, dataSource.createEntityManager());
  }

  async findOneByAdminId(admin_id: string): Promise<Admin | null> {
    return this.findOne({
      where: { admin_id },
      relations: ['user'],
    });
  }

  // user_id ahora es el ID (UUID) del usuario
  async findByUserId(user_id: string): Promise<Admin | null> {
    return this.findOne({
      where: { user_id },
      relations: ['user'],
    });
  }

  async findAll(): Promise<Admin[]> {
    return this.find({ relations: ['user'] });
  }

  async removeByAdminId(admin_id: string): Promise<DeleteResult> {
    return this.delete({ admin_id });
  }

  // user_id ahora es el ID (UUID) del usuario
  async removeByUserId(user_id: string): Promise<DeleteResult> {
    return this.delete({ user_id });
  }
}
