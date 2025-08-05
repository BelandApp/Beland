import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({
    description: 'ID único del rol',
    example: 'uuid',
  })
  role_id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'USER', // USER, LEADER, ADMIN, SUPERADMIN, EMPRESA
  })
  // ¡ACTUALIZADO para incluir EMPRESA!
  name: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'EMPRESA';

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Usuario básico del sistema',
    nullable: true, // Añadido nullable para coincidir con la entidad
  })
  description: string | null; // Cambiado a string | null

  @ApiProperty({
    description: 'Si el rol está activo',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;
}
