import { PartialType } from '@nestjs/mapped-types';
import { CreateAmountToPaymentDto } from './create-amount-to-payment.dto';

export class UpdateAmountToPaymentDto extends PartialType(CreateAmountToPaymentDto) {}
