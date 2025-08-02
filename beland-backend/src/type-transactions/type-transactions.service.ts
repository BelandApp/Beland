import { Injectable } from '@nestjs/common';
import { CreateTypeTransactionDto } from './dto/create-type-transaction.dto';
import { UpdateTypeTransactionDto } from './dto/update-type-transaction.dto';

@Injectable()
export class TypeTransactionsService {
  create(createTypeTransactionDto: CreateTypeTransactionDto) {
    return 'This action adds a new typeTransaction';
  }

  findAll() {
    return `This action returns all typeTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} typeTransaction`;
  }

  update(id: number, updateTypeTransactionDto: UpdateTypeTransactionDto) {
    return `This action updates a #${id} typeTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} typeTransaction`;
  }
}
