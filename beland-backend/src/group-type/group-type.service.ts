import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GroupType } from './entities/group-type.entity';
import { GroupTypeRepository } from './group-type.repository';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class GroupTypeService {
  private readonly completeMessage = 'el tipo de grupo';

  constructor(private readonly repository: GroupTypeRepository) {}

  async findAll(
    pageNumber: number,
    limitNumber: number,
  ): Promise<[GroupType[], number]> {
    try {
      const response = await this.repository.findAll(
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<GroupType> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<GroupType>): Promise<GroupType> {
    try {
      const res = await this.repository.create(body);
      if (!res)
        throw new InternalServerErrorException(
          `No se pudo crear ${this.completeMessage}`,
        );
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, body: Partial<GroupType>) {
    try {
      const res = await this.repository.update(id, body);
      if (res.affected === 0)
        throw new NotFoundException(
          `No se encontró ${this.completeMessage}`,
        );
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      const res = await this.repository.remove(id);
      if (res.affected === 0)
        throw new NotFoundException(
          `No se encontró ${this.completeMessage}`,
        );
      return res;
    } catch (error) {
      throw new ConflictException(`No se puede eliminar ${this.completeMessage}`);
    }
  }

  async getProductsByGroupType(groupTypeId: string): Promise<Product[]> {
    try {
      const response = await this.repository.getProductsByGroupType(groupTypeId);
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
