import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentMethodDto } from './create-payment_method.dto';

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {}
