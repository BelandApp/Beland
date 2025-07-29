import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Post()
  create(@Body() createPrizeDto: CreatePrizeDto) {
    return this.prizesService.create(createPrizeDto);
  }

  @Get()
  findAll() {
    return this.prizesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prizesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrizeDto: UpdatePrizeDto) {
    return this.prizesService.update(+id, updatePrizeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prizesService.remove(+id);
  }
}
