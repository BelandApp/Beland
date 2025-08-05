import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BankAccountTypeService } from './bank-account-type.service';
import { CreateBankAccountTypeDto } from './dto/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from './dto/update-bank-account-type.dto';

@Controller('bank-account-type')
export class BankAccountTypeController {
  constructor(private readonly bankAccountTypeService: BankAccountTypeService) {}

  @Post()
  create(@Body() createBankAccountTypeDto: CreateBankAccountTypeDto) {
    return this.bankAccountTypeService.create(createBankAccountTypeDto);
  }

  @Get()
  findAll() {
    return this.bankAccountTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankAccountTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBankAccountTypeDto: UpdateBankAccountTypeDto) {
    return this.bankAccountTypeService.update(+id, updateBankAccountTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankAccountTypeService.remove(+id);
  }
}
