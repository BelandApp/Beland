import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  owner_name: string;

  @IsString()
  bank_code: string;

  @IsUUID()
  account_type_id: string;

  @IsString()
  cbu: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsUUID()
  user_id:string;
}