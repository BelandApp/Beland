import { PartialType } from '@nestjs/mapped-types';
import { CreateWithdrawAccountTypeDto } from './create-withdraw-account-type.dto';

export class UpdateWithdrawAccountTypeDto extends PartialType(CreateWithdrawAccountTypeDto) {}
