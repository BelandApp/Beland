import { IsString, IsNumber, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecyclePriceDto {
  @ApiProperty({
    description: 'Tipo de material reciclable',
    example: 'Plástico PET',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @Length(1, 50)
  material_type: string;

  @ApiProperty({
    description: 'Valor en Becoin por unidad del material reciclable',
    example: 12.50,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  becoin_value: number;
}
