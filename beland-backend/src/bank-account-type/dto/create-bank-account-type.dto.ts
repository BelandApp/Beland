import { IsOptional, IsString, Length } from "class-validator";

export class CreateBankAccountTypeDto {
    
    /** Código único del tipo: AHORRO, CORRIENTE */
    @IsString()
    @Length(2, 100)
    code: string;

    /** Nombre legible: Cuenta de Ahorro, Cuenta Corriente. */
    @IsString()
    @Length(2, 100)
    name: string;

    /** Descripción opcional para la UI */
    @IsOptional()
    @IsString()
    description?: string;
}
