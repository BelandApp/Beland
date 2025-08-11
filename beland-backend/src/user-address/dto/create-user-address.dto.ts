import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  Length,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserAddressDto {
  @IsString()
  @IsNotEmpty()
  @Length(36, 36) // UUID
  user_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  addressLine1: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;
}
