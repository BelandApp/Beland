import { PartialType } from '@nestjs/mapped-types';
import { CreateCharityDto } from './create-charity.dto';

export class UpdateCharityDto extends PartialType(CreateCharityDto) {}
