import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentTypeDto } from './create-payment-type.dto';

export class UpdatePaymentTypeDto extends PartialType(CreatePaymentTypeDto) {}
