import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateWalletTypeDto {
  @ApiProperty({
    example: 'USER',
    description: 'Código único del tipo de wallet (USER, SUPERADMIN, COMMERCE, FUNDATION, etc.)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Usuario',
    description: 'Nombre legible del tipo de wallet',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Wallet estándar para usuarios comunes.',
    description: 'Descripción opcional para mostrar en la UI',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
