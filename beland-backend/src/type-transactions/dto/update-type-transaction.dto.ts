import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeTransactionDto } from './create-type-transaction.dto';

export class UpdateTypeTransactionDto extends PartialType(CreateTypeTransactionDto) {}
