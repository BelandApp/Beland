import { IsUUID, IsInt, Min, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartItemDto {
  @IsUUID()
  cart_id: string;

  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  unit_price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  subtotal: number;
}
