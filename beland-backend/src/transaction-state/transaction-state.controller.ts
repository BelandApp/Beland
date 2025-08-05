import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionStateService } from './transaction-state.service';
import { CreateTransactionStateDto } from './dto/create-transaction-state.dto';
import { UpdateTransactionStateDto } from './dto/update-transaction-state.dto';

@Controller('transaction-state')
export class TransactionStateController {
  constructor(private readonly transactionStateService: TransactionStateService) {}

  @Post()
  create(@Body() createTransactionStateDto: CreateTransactionStateDto) {
    return this.transactionStateService.create(createTransactionStateDto);
  }

  @Get()
  findAll() {
    return this.transactionStateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionStateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionStateDto: UpdateTransactionStateDto) {
    return this.transactionStateService.update(+id, updateTransactionStateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionStateService.remove(+id);
  }
}
