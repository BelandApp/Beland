import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer'; // Se mantiene Expose si se usa para mapear propiedades de relaciones

export class UserDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 'uuid',
  })
  id: string; // ID (UUID) como clave primaria

  @ApiProperty({
    description: 'Proveedor de autenticación',
    example: 'google',
    nullable: true,
  })
  oauth_provider: string | null;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'johndoe',
    nullable: true,
  })
  username: string | null;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe',
    nullable: true,
  })
  full_name: string | null;

  @ApiProperty({
    description: 'URL de la imagen de perfil',
    example: 'https://example.com/photo.jpg',
    nullable: true,
  })
  profile_picture_url: string | null;

  @ApiProperty({
    description: 'Saldo actual del usuario',
    example: 100.5,
  })
  current_balance: number;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'USER',
  })
  // Mapea directamente la columna 'role_name' de la entidad User
  // ¡Añadido 'EMPRESA' aquí!
  role_name: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'COMMERCE' | 'FUNDATION'; // Tipo literal para los roles

  @ApiProperty({
    description: 'ID del rol del usuario (clave foránea)',
    example: 'uuid',
    nullable: true,
  })
  role_id: string | null; // ID del rol (FK)

  @ApiProperty({
    description: 'ID de Auth0 del usuario (opcional, si se usa Auth0)',
    example: 'auth0|abcdef1234567890abcdef1234',
    nullable: true,
  })
  auth0_id: string | null; // ID de Auth0

  @ApiProperty({
    description: 'Dirección del usuario',
    example: 'Calle 123, Ciudad',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: 'Número de teléfono',
    example: 1234567890,
    nullable: true,
  })
  phone: number | null;

  @ApiProperty({
    description: 'País del usuario',
    example: 'Colombia',
    nullable: true,
  })
  country: string | null;

  @ApiProperty({
    description: 'Ciudad del usuario',
    example: 'Bogotá',
    nullable: true,
  })
  city: string | null;

  @ApiProperty({
    description: 'Si el usuario está bloqueado',
    example: false,
  })
  isBlocked: boolean;

  @ApiProperty({
    description: 'Fecha de eliminación (soft delete)',
    example: null,
    nullable: true,
  })
  deleted_at: Date | null;

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
