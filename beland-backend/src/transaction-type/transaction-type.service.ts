import { Injectable } from '@nestjs/common';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';

@Injectable()
export class TransactionTypeService {
  create(createTransactionTypeDto: CreateTransactionTypeDto) {
    return 'This action adds a new transactionType';
  }

  findAll() {
    return `This action returns all transactionType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionType`;
  }

  update(id: number, updateTransactionTypeDto: UpdateTransactionTypeDto) {
    return `This action updates a #${id} transactionType`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionType`;
  }
}
