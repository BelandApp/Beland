import { Injectable } from '@nestjs/common';
import { CreateRecyclePriceDto } from './dto/create-recycle_price.dto';
import { UpdateRecyclePriceDto } from './dto/update-recycle_price.dto';

@Injectable()
export class RecyclePricesService {
  create(createRecyclePriceDto: CreateRecyclePriceDto) {
    return 'This action adds a new recyclePrice';
  }

  findAll() {
    return `This action returns all recyclePrices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recyclePrice`;
  }

  update(id: number, updateRecyclePriceDto: UpdateRecyclePriceDto) {
    return `This action updates a #${id} recyclePrice`;
  }

  remove(id: number) {
    return `This action removes a #${id} recyclePrice`;
  }
}
