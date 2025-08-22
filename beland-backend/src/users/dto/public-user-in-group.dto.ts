// src/users/dto/public-user-in-group.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * DTO para exponer información mínima de un usuario dentro de un grupo público.
 */
export class PublicUserInGroupDto {
  @Expose()
  @ApiProperty({
    description: 'ID único del usuario.',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Nombre completo del usuario.',
    example: 'Juan Pérez',
  })
  full_name: string; // Asumo que tienes este campo en tu entidad User

  @Expose()
  @ApiProperty({
    description: 'URL de la foto de perfil del usuario.',
    example: 'https://example.com/profiles/juanperez.jpg',
  })
  profile_picture: string; // Asumo que tienes este campo en tu entidad User
}
