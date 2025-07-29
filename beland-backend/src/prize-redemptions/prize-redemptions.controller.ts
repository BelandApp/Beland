import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrizeRedemptionsService } from './prize-redemptions.service';
import { CreatePrizeRedemptionDto } from './dto/create-prize-redemption.dto';
import { UpdatePrizeRedemptionDto } from './dto/update-prize-redemption.dto';

@Controller('prize-redemptions')
export class PrizeRedemptionsController {
  constructor(private readonly prizeRedemptionsService: PrizeRedemptionsService) {}

  @Post()
  create(@Body() createPrizeRedemptionDto: CreatePrizeRedemptionDto) {
    return this.prizeRedemptionsService.create(createPrizeRedemptionDto);
  }

  @Get()
  findAll() {
    return this.prizeRedemptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prizeRedemptionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrizeRedemptionDto: UpdatePrizeRedemptionDto) {
    return this.prizeRedemptionsService.update(+id, updatePrizeRedemptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prizeRedemptionsService.remove(+id);
  }
}
