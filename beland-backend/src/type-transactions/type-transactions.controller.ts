import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypeTransactionsService } from './type-transactions.service';
import { CreateTypeTransactionDto } from './dto/create-type-transaction.dto';
import { UpdateTypeTransactionDto } from './dto/update-type-transaction.dto';

@Controller('type-transactions')
export class TypeTransactionsController {
  constructor(private readonly typeTransactionsService: TypeTransactionsService) {}

  @Post()
  create(@Body() createTypeTransactionDto: CreateTypeTransactionDto) {
    return this.typeTransactionsService.create(createTypeTransactionDto);
  }

  @Get()
  findAll() {
    return this.typeTransactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeTransactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeTransactionDto: UpdateTypeTransactionDto) {
    return this.typeTransactionsService.update(+id, updateTypeTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeTransactionsService.remove(+id);
  }
}
