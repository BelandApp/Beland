import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({
    description: 'Nombre del titular de la cuenta',
    example: 'Juan Pérez',
  })
  @IsString()
  owner_name: string;

  @ApiProperty({
    description: 'Código del banco',
    example: '001',
  })
  @IsString()
  bank_code: string;

  @ApiProperty({
    description: 'ID del tipo de cuenta bancaria',
    example: 'd3f5e7a1-1234-5678-abcd-9876543210fe',
  })
  @IsUUID()
  account_type_id: string;

  @ApiProperty({
    description: 'CBU (Clave Bancaria Uniforme)',
    example: '1234567890123456789012',
  })
  @IsString()
  cbu: string;

  @ApiPropertyOptional({
    description: 'Alias de la cuenta (opcional)',
    example: 'mi_cuenta_principal',
  })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({
    description: 'ID del usuario propietario de la cuenta',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsUUID()
  user_id: string;
}
