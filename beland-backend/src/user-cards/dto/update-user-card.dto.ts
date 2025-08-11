import { PartialType } from '@nestjs/mapped-types';
import { CreateUserCardDto } from './create-user-card.dto';

export class UpdateUserCardDto extends PartialType(CreateUserCardDto) {}
