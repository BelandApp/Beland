import { IsString, IsOptional, Length } from 'class-validator';

export class CreateTransactionStateDto {    
    /** Código único: PENDING, COMPLETED, FAILED */
  @IsString()
  @Length(2, 100)
  code: string;

  /** Nombre legible: Pendiente, Completada, Fallida */
  @IsString()
  @Length(2, 100)
  name: string;

  /** Descripción opcional para la UI */
  @IsOptional()
  @IsString()
  description?: string;
}