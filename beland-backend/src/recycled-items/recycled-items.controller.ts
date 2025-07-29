import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecycledItemsService } from './recycled-items.service';
import { CreateRecycledItemDto } from './dto/create-recycled-item.dto';
import { UpdateRecycledItemDto } from './dto/update-recycled-item.dto';

@Controller('recycled-items')
export class RecycledItemsController {
  constructor(private readonly recycledItemsService: RecycledItemsService) {}

  @Post()
  create(@Body() createRecycledItemDto: CreateRecycledItemDto) {
    return this.recycledItemsService.create(createRecycledItemDto);
  }

  @Get()
  findAll() {
    return this.recycledItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recycledItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecycledItemDto: UpdateRecycledItemDto) {
    return this.recycledItemsService.update(+id, updateRecycledItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recycledItemsService.remove(+id);
  }
}
