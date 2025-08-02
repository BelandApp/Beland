import { IsString } from "class-validator";

export class CreateBankAccountDto {
  /** Etiqueta para el usuario, p.ej. "Mi cuenta sueldo" */
  @IsString()
  alias: string;

  /** CBU o número de cuenta real, requerido por PayPhone */
  @IsString()
  cbu: string;

  /** Opcional: código de banco, tipo de cuenta, titular, etc. */
  @IsString()
  bankName: string;

  @IsString()
  holderName: string;
}