import { PartialType } from '@nestjs/mapped-types';
import { CreateWithdrawAccountDto } from './create-withdraw-account.dto';

export class UpdateWithdrawAccountDto extends PartialType(CreateWithdrawAccountDto) {}
