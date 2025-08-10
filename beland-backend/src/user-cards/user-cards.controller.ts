import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserCardsService } from './user-cards.service';
import { CreateUserCardDto } from './dto/create-user-card.dto';
import { UpdateUserCardDto } from './dto/update-user-card.dto';

@Controller('user-cards')
export class UserCardsController {
  constructor(private readonly userCardsService: UserCardsService) {}

  @Post()
  create(@Body() createUserCardDto: CreateUserCardDto) {
    return this.userCardsService.create(createUserCardDto);
  }

  @Get()
  findAll() {
    return this.userCardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userCardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserCardDto: UpdateUserCardDto) {
    return this.userCardsService.update(+id, updateUserCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userCardsService.remove(+id);
  }
}
