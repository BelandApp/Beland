import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserWithdraw } from './entities/user-withdraw.entity';
import { UserWithdrawsRepository } from './user-withdraw.repository';

@Injectable()
export class UserWithdrawsService {
  private readonly completeMessage = 'el retiro del usuario';

  constructor(private readonly repository: UserWithdrawsRepository) {}

  async findAll(
    user_id: string,
    status_id: string,
    type_id: string,
    pageNumber: number,
    limitNumber: number,
  ): Promise<[UserWithdraw[], number]> {
    try {
      const response = await this.repository.findAll(
        user_id,
        status_id,
        type_id,
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string): Promise<UserWithdraw> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(
    body: Partial<UserWithdraw>,
  ): Promise<UserWithdraw> {
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

  async update(id: string, body: Partial<UserWithdraw>) {
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
