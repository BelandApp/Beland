import { Injectable } from '@nestjs/common';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryItemsService {
  create(createInventoryItemDto: CreateInventoryItemDto) {
    return 'This action adds a new inventoryItem';
  }

  findAll() {
    return `This action returns all inventoryItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventoryItem`;
  }

  update(id: number, updateInventoryItemDto: UpdateInventoryItemDto) {
    return `This action updates a #${id} inventoryItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventoryItem`;
  }
}
