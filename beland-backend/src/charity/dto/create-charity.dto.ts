import { IsString, IsOptional, IsEmail, Length, IsUrl, IsUUID, IsBoolean } from 'class-validator';

export class CreateCharityDto {
  /** Nombre legal de la fundación */
  @IsString()
  @Length(2, 150)
  name: string;

  /** Nombre comercial o abreviado (opcional) */
  @IsOptional()
  @IsString()
  @Length(2, 100)
  display_name?: string;

  /** Número de registro legal / RUC / Tax ID */
  @IsString()
  @Length(5, 50)
  registration_number: string;

  /** Descripción corta de la fundación (opcional) */
  @IsOptional()
  @IsString()
  description?: string;

  /** Página web oficial (opcional) */
  @IsOptional()
  @IsUrl()
  website?: string;

  /** Email de contacto principal */
  @IsEmail()
  email: string;

  /** Teléfono de contacto (opcional) */
  @IsOptional()
  @IsString()
  @Length(5, 20)
  phone?: string;

  /** Dirección física (opcional) */
  @IsOptional()
  @IsString()
  @Length(5, 255)
  address?: string;

  /** Logo o imagen representativa (opcional) */
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  /** Usuario creador a la fundacion */
  @IsUUID()
  user_id: string;

  /** Estado: activa o deshabilitada (por defecto true) */
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
