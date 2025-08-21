import { PartialType } from '@nestjs/mapped-types';
import { CreateUserWithdrawDto } from './create-user-withdraw.dto';

export class UpdateUserWithdrawDto extends PartialType(CreateUserWithdrawDto) {}
