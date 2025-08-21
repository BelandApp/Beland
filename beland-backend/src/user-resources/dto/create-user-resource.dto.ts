import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateUserResourceDto {
  @ApiProperty({
    description: 'ID of the resource being purchased',
    example: 'b6d2f4af-92c1-4a1e-bc4e-54d61e8bb37d',
  })
  @IsUUID()
  @IsNotEmpty()
  resource_id: string;

  @ApiProperty({
    description: 'Quantity of the resource being purchased',
    example: 2,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
