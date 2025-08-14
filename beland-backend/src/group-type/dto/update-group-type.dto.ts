import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupTypeDto } from './create-group-type.dto';

export class UpdateGroupTypeDto extends PartialType(CreateGroupTypeDto) {}
