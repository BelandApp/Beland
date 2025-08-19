import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDate,
  MaxLength,
  Min,
  Max,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'BecoinOrDiscount', async: false })
export class BecoinOrDiscountRule implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    const becoin = obj.becoin_value ?? 0;
    const discount = obj.discount ?? 0;

    // regla: uno de los dos debe ser > 0 y el otro debe ser 0 o ausente
    if (becoin > 0 && discount === 0) return true;
    if (discount > 0 && becoin === 0) return true;
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'You must provide either a positive becoin_value or a discount (1-100), but not both.';
  }
}

export class CreateResourceDto {
  @ApiProperty({
    description: 'Unique code that identifies the resource',
    example: 'DISC-2025-01',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Name of the resource',
    example: '20% Off in Supermarket',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed description of the resource',
    example: 'Valid for all products in participating stores until stock runs out.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Optional URL to the resource image',
    example: 'https://beland.com/resources/img123.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  url_image?: string;

  @ApiProperty({
    description: 'Becoin value assigned to this resource (must be >0 if discount is 0)',
    example: 100,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Type(() => Number)
  @Min(0)
  becoin_value: number;

  @ApiProperty({
    description: 'Discount percentage applied (1–100, must be >0 if becoin_value is 0)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Type(() => Number)
  @Min(0)
  @Max(100)
  discount: number;

  @ApiProperty({
    description: 'Indicates if the resource is expired',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_expired?: boolean;

  @ApiProperty({
    description: 'Expiration date of the resource',
    example: '2025-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expires_at?: Date;

  @ApiProperty({
    description: 'Resource type ID (foreign key)',
    example: 'cbe36a6b-9c39-4a40-ae26-5a7b4b217f40',
  })
  @IsUUID()
  @IsNotEmpty()
  resource_type_id: string;

  // aplicamos el validador custom al DTO completo
  @Validate(BecoinOrDiscountRule)
  _becoinOrDiscountValidation: boolean;
}
