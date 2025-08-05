import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionTypeService } from './transaction-type.service';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';

@Controller('transaction-type')
export class TransactionTypeController {
  constructor(private readonly transactionTypeService: TransactionTypeService) {}

  @Post()
  create(@Body() createTransactionTypeDto: CreateTransactionTypeDto) {
    return this.transactionTypeService.create(createTransactionTypeDto);
  }

  @Get()
  findAll() {
    return this.transactionTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionTypeDto: UpdateTransactionTypeDto) {
    return this.transactionTypeService.update(+id, updateTransactionTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionTypeService.remove(+id);
  }
}
