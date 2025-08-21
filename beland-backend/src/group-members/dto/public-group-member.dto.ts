// src/group-members/dto/public-group-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PublicUserInGroupDto } from 'src/users/dto/public-user-in-group.dto'; // Importa el DTO de usuario público

/**
 * DTO para exponer información mínima de un miembro de grupo en la vista pública.
 */
export class PublicGroupMemberDto {
  @Expose()
  @ApiProperty({
    description: 'ID de la membresía del grupo.',
    example: 'e290f1ee-6c54-4b01-90e6-d701748f0852',
  })
  id: string; // El ID de la entrada de GroupMember

  @Expose()
  @Type(() => PublicUserInGroupDto) // Aplica la transformación al DTO de usuario público
  @ApiProperty({
    type: PublicUserInGroupDto,
    description: 'Detalles del usuario miembro.',
  })
  user: PublicUserInGroupDto; // Solo la información pública del usuario
}
