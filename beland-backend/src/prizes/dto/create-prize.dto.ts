// src/prizes/dto/create-prize.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreatePrizeDto {
  @ApiProperty({ description: 'Nombre del premio' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descripción del premio' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Costo del premio en monedas internas' })
  @IsNumber()
  cost: number;

  @ApiProperty({ description: 'URL de la imagen del premio' })
  @IsString()
  image_url: string;

  @ApiProperty({ description: 'Cantidad disponible (stock)' })
  @IsNumber()
  stock: number;
}
