import { IsString, IsNumber, Length, Min } from 'class-validator';

export class CreateRecyclePriceDto {
  @IsString()
  @Length(1, 50)
  material_type: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  becoin_value: number;
}