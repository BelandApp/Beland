import { PartialType } from '@nestjs/mapped-types';
import { CreateResourcesTypeDto } from './create-resources-type.dto';

export class UpdateResourcesTypeDto extends PartialType(CreateResourcesTypeDto) {}
