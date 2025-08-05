import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsUUID,
  Length,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMerchantDto {
  @IsString()
  @Length(2, 150)
  business_name: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  legal_name?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  ruc?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  province?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  longitude?: number;

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsUUID()
  user_id: string;
}
