import { PartialType } from '@nestjs/mapped-types';
import { CreateUserResourceDto } from './create-user-resource.dto';

export class UpdateUserResourceDto extends PartialType(CreateUserResourceDto) {}
