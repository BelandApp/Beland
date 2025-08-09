import { IsOptional, IsString, Length } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountTypeDto {
  @ApiProperty({
    description: 'Código único del tipo de cuenta bancaria (ejemplo: AHORRO, CORRIENTE)',
    minLength: 2,
    maxLength: 100,
    example: 'AHORRO',
  })
  @IsString()
  @Length(2, 100)
  code: string;

  @ApiProperty({
    description: 'Nombre legible para mostrar en la UI',
    minLength: 2,
    maxLength: 100,
    example: 'Cuenta de Ahorro',
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional para la interfaz de usuario',
    example: 'Cuenta bancaria de ahorro con beneficios adicionales',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
