import { Injectable } from '@nestjs/common';
import { CreateBankAccountTypeDto } from './dto/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from './dto/update-bank-account-type.dto';

@Injectable()
export class BankAccountTypeService {
  create(createBankAccountTypeDto: CreateBankAccountTypeDto) {
    return 'This action adds a new bankAccountType';
  }

  findAll() {
    return `This action returns all bankAccountType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bankAccountType`;
  }

  update(id: number, updateBankAccountTypeDto: UpdateBankAccountTypeDto) {
    return `This action updates a #${id} bankAccountType`;
  }

  remove(id: number) {
    return `This action removes a #${id} bankAccountType`;
  }
}
