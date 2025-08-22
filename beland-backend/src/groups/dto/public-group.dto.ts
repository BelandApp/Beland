// src/groups/dto/public-group.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PublicGroupMemberDto } from 'src/group-members/dto/public-group-member.dto'; // Importa el DTO de miembro público

/**
 * DTO para la exposición pública de información resumida de un grupo.
 * Ideal para la landing page.
 */
export class PublicGroupDto {
  @Expose()
  @ApiProperty({
    description: 'ID único del grupo.',
    example: 'f290f1ee-6c54-4b01-90e6-d701748f0853',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Nombre del grupo.',
    example: 'Exploradores de la Naturaleza',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'URL de la imagen o logo del grupo.',
    example: 'https://example.com/groups/nature_explorers.jpg',
  })
  image: string; // Asumo que tienes un campo 'image' en tu entidad Group para la foto del grupo

  @Expose()
  @Type(() => PublicGroupMemberDto)
  @ApiProperty({
    type: [PublicGroupMemberDto],
    description: 'Lista de miembros del grupo con información pública.',
  })
  members: PublicGroupMemberDto[]; // Solo la información pública de los miembros
}
