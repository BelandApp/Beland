import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrizesRepository } from './prizes.repository';
import { Prize } from './entities/prize.entity';

@Injectable()
export class PrizesService {
  private readonly completeMessage = 'el premio';

  constructor(private readonly repository: PrizesRepository) {}

  async findAll(
    pageNumber: number,
    limitNumber: number,
  ): Promise<[Prize[], number]> {
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

  async findOne(id: string): Promise<Prize> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<Prize>): Promise<Prize> {
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

  async update(id: string, body: Partial<Prize>) {
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
}
