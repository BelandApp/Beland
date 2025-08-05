import { Injectable } from '@nestjs/common';
import { CreateTransactionStateDto } from './dto/create-transaction-state.dto';
import { UpdateTransactionStateDto } from './dto/update-transaction-state.dto';

@Injectable()
export class TransactionStateService {
  create(createTransactionStateDto: CreateTransactionStateDto) {
    return 'This action adds a new transactionState';
  }

  findAll() {
    return `This action returns all transactionState`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionState`;
  }

  update(id: number, updateTransactionStateDto: UpdateTransactionStateDto) {
    return `This action updates a #${id} transactionState`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionState`;
  }
}
