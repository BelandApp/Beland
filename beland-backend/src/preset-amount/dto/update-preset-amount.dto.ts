import { PartialType } from '@nestjs/mapped-types';
import { CreatePresetAmountDto } from './create-preset-amount.dto';

export class UpdatePresetAmountDto extends PartialType(CreatePresetAmountDto) {}
