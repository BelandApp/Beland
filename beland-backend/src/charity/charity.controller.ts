import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CharityService } from './charity.service';
import { CreateCharityDto } from './dto/create-charity.dto';
import { UpdateCharityDto } from './dto/update-charity.dto';

@Controller('charity')
export class CharityController {
  constructor(private readonly charityService: CharityService) {}

  @Post()
  create(@Body() createCharityDto: CreateCharityDto) {
    return this.charityService.create(createCharityDto);
  }

  @Get()
  findAll() {
    return this.charityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.charityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCharityDto: UpdateCharityDto) {
    return this.charityService.update(+id, updateCharityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.charityService.remove(+id);
  }
}
