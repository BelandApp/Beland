import { Injectable } from '@nestjs/common';
import { CreateRecycledItemDto } from './dto/create-recycled-item.dto';
import { UpdateRecycledItemDto } from './dto/update-recycled-item.dto';

@Injectable()
export class RecycledItemsService {
  create(createRecycledItemDto: CreateRecycledItemDto) {
    return 'This action adds a new recycledItem';
  }

  findAll() {
    return `This action returns all recycledItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recycledItem`;
  }

  update(id: number, updateRecycledItemDto: UpdateRecycledItemDto) {
    return `This action updates a #${id} recycledItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} recycledItem`;
  }
}
