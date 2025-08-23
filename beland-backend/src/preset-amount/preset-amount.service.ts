import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PresetAmount } from './entities/preset-amount.entity';
import { PresetAmountsRepository } from './preset-amount.repository';

@Injectable()
export class PresetAmountsService {
  private readonly completeMessage = 'el monto preestablecido';

  constructor(private readonly repository: PresetAmountsRepository) {}

  async findAll(
      user_commerce_id: string,
      pageNumber: number,
      limitNumber: number,
    ): Promise<[PresetAmount[], number]> {
      try {
        const response = await this.repository.findAll(
          user_commerce_id,
          pageNumber,
          limitNumber,
        );
        return response;
      } catch (error) {
        throw new InternalServerErrorException(error);
      }
    }

  async findOne(id: string): Promise<PresetAmount> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<PresetAmount>): Promise<PresetAmount> {
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

  async update(id: string, body: Partial<PresetAmount>) {
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
