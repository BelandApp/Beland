import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionStateDto } from './create-transaction-state.dto';

export class UpdateTransactionStateDto extends PartialType(CreateTransactionStateDto) {}
