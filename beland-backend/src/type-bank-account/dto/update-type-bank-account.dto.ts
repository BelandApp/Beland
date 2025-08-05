import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeBankAccountDto } from './create-type-bank-account.dto';

export class UpdateTypeBankAccountDto extends PartialType(CreateTypeBankAccountDto) {}
