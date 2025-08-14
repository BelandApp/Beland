import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserCard } from './entities/user-card.entity';
import { CardResponseDto } from './dto/resp-user-card-pay.dto';

@Injectable()
export class UserCardsRepository {
  constructor(
    @InjectRepository(UserCard)
    private repository: Repository<UserCard>,
  ) {}

  async findAll(
    user_id: string,
    page: number,
    limit: number,
  ): Promise<[UserCard[], number]> {

    return this.repository.findAndCount({
        where: {user_id},
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
  } 

  async findOne(id: string): Promise<UserCard> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(body: Partial<UserCard>): Promise<UserCard> {
    return await this.repository.save(body);
  }

  async update(id: string, body: Partial<UserCard>): Promise<UpdateResult> {
    return await this.repository.update(id, body);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }

  async dataPayCard (id:string): Promise<CardResponseDto> {
    const card = await this.repository.findOneBy({id})
    const returnCard:CardResponseDto = {
        cardHolder: card.cardHolder,
        cardToken: card.cardToken,
        documentId: card.documentId,
        phoneNumber: card.phoneNumber,
        email: card.email,
    }
    return returnCard;
  }
}
