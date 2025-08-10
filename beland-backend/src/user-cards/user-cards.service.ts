import { Injectable } from '@nestjs/common';
import { CreateUserCardDto } from './dto/create-user-card.dto';
import { UpdateUserCardDto } from './dto/update-user-card.dto';

@Injectable()
export class UserCardsService {
  create(createUserCardDto: CreateUserCardDto) {
    return 'This action adds a new userCard';
  }

  findAll() {
    return `This action returns all userCards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userCard`;
  }

  update(id: number, updateUserCardDto: UpdateUserCardDto) {
    return `This action updates a #${id} userCard`;
  }

  remove(id: number) {
    return `This action removes a #${id} userCard`;
  }
}
