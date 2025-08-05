import { Injectable } from '@nestjs/common';
import { CreateCharityDto } from './dto/create-charity.dto';
import { UpdateCharityDto } from './dto/update-charity.dto';

@Injectable()
export class CharityService {
  create(createCharityDto: CreateCharityDto) {
    return 'This action adds a new charity';
  }

  findAll() {
    return `This action returns all charity`;
  }

  findOne(id: number) {
    return `This action returns a #${id} charity`;
  }

  update(id: number, updateCharityDto: UpdateCharityDto) {
    return `This action updates a #${id} charity`;
  }

  remove(id: number) {
    return `This action removes a #${id} charity`;
  }
}
