import { PartialType } from '@nestjs/mapped-types';
import { CreateBankAccountTypeDto } from './create-bank-account-type.dto';

export class UpdateBankAccountTypeDto extends PartialType(CreateBankAccountTypeDto) {}
