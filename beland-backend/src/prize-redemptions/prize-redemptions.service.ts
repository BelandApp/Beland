import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrizeRedemptionsRepository } from './prize-redemptions.repository';
import { PrizeRedemption } from './entities/prize-redemption.entity';

@Injectable()
export class PrizeRedemptionsService {
  private readonly completeMessage = 'el canje de premio';

  constructor(private readonly repository: PrizeRedemptionsRepository) {}

  async findAll(
    group_id: string, 
    user_id: string,
    pageNumber: number,
    limitNumber: number,
  ): Promise<[PrizeRedemption[], number]> {
    try {
      const response = await this.repository.findAll(
        group_id,
        user_id,
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<PrizeRedemption> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<PrizeRedemption>): Promise<PrizeRedemption> {
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

  async update(id: string, body: Partial<PrizeRedemption>) {
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
