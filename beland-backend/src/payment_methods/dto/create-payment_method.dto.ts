import {
  IsUUID,
  IsString,
  Length,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreatePaymentMethodDto {
  @IsUUID()
  user_id: string;

  @IsString()
  token: string; // token devuelto por PayPhone

  @IsString()
  @IsOptional()
  description?: string;
  
  @IsString()
  brand: string; // Visa, Mastercard...

  @IsString()
  @Length(4, 4)
  last4: string; // últimos 4 dígitos

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
