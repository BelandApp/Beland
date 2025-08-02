import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecyclePricesService } from './recycle_prices.service';
import { CreateRecyclePriceDto } from './dto/create-recycle_price.dto';
import { UpdateRecyclePriceDto } from './dto/update-recycle_price.dto';

@Controller('recycle-prices')
export class RecyclePricesController {
  constructor(private readonly recyclePricesService: RecyclePricesService) {}

  @Post()
  create(@Body() createRecyclePriceDto: CreateRecyclePriceDto) {
    return this.recyclePricesService.create(createRecyclePriceDto);
  }

  @Get()
  findAll() {
    return this.recyclePricesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recyclePricesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecyclePriceDto: UpdateRecyclePriceDto) {
    return this.recyclePricesService.update(+id, updateRecyclePriceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recyclePricesService.remove(+id);
  }
}
