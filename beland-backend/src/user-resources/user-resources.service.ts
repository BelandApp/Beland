import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserResource } from './entities/user-resource.entity';
import { UserResourcesRepository } from './user-resources.repository';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class UserResourcesService {
  private readonly completeMessage = 'el recurso del usuario';

  constructor(private readonly repository: UserResourcesRepository) {}

  async findAll(
    user_id: string,
    resource_id: string,
    pageNumber: number,
    limitNumber: number,
  ): Promise<[UserResource[], number]> {
    try {
      const response = await this.repository.findAll(
        user_id,
        resource_id,
        pageNumber,
        limitNumber,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTotalAvailable(resource_id: string): Promise<{ total_available: number }> {
    return await this.repository.getTotalAvailable(resource_id);
  }

  async getRemainingByHash(hash_id: string, user_id: string): Promise<{ remaining: number }> {
    return await this.repository.getRemainingByHash(hash_id, user_id)
  }

  async findOne(id: string): Promise<UserResource> {
    try {
      const res = await this.repository.findOne(id);
      if (!res)
        throw new NotFoundException(`No se encontro ${this.completeMessage}`);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(body: Partial<UserResource>): Promise<UserResource> {
    try {
      // Generar hash_id único (UUID)
      const hash_id = uuidv4();

      // Generar código QR en base64 que contiene el hashId
      const qr_code = await QRCode.toDataURL(hash_id);
      const res = await this.repository.create({
        ...body,
        hash_id,
        qr_code,
      });
      if (!res)
        throw new InternalServerErrorException(
          `No se pudo crear ${this.completeMessage}`,
        );
      return res;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async redeem(hash_id: string, user_id: string, quantity: number): Promise<any> {
  const userResource = await this.repository.findByUserHash(hash_id, user_id );

    if (!userResource) {
      throw new NotFoundException(`No se encontró el recurso de usuario con hash_id ${hash_id}`);
    }

    const remaining = userResource.quantity - (userResource.quantity_redeemed || 0);

    if (quantity > 0) {
      if (quantity > remaining) {
        throw new BadRequestException(`No tiene suficientes entradas disponibles. Quedan ${remaining}`);
      }

      userResource.quantity_redeemed = (userResource.quantity_redeemed || 0) + quantity;

      if (userResource.quantity_redeemed === userResource.quantity) {
        userResource.is_redeemed = true;
        userResource.redeemed_at = new Date();
      }

      await this.repository.create(userResource);

      return {
        message: 'Redención exitosa',
        remaining: userResource.quantity - userResource.quantity_redeemed,
      };
    } else {
        // cantidad negativa -> resta de quantity_redeemed
        const absQuantity = Math.abs(quantity);
        if ((userResource.quantity_redeemed || 0) < absQuantity) {
          throw new BadRequestException('No se puede restar más entradas de las redimidas');
        }

        userResource.quantity_redeemed -= absQuantity;
        if (userResource.quantity_redeemed < userResource.quantity) {
          userResource.is_redeemed = false;
          userResource.redeemed_at = null;
        }

        await this.repository.create(userResource);

        return {
          message: 'Cantidad ajustada exitosamente',
          remaining: userResource.quantity - userResource.quantity_redeemed,
        };
    }
  }

  async update(id: string, body: Partial<UserResource>) {
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
