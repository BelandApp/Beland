import { PartialType } from '@nestjs/mapped-types';
import { CreateRecyclePriceDto } from './create-recycle_price.dto';

export class UpdateRecyclePriceDto extends PartialType(CreateRecyclePriceDto) {}
