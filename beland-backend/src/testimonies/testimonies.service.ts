// src/testimonies/testimony.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { TestimonyRepository } from './testimony.repository';
import { UsersService } from 'src/users/users.service';
import { CreateTestimonyDto } from './dto/create-testimony.dto';
import { UpdateTestimonyDto } from './dto/update-testimony.dto';
import { TestimonyDto } from './dto/testimony.dto'; // Importación correcta (singular)
import { Testimony } from './entities/testimony.entity';
import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';
import { GetTestimoniesQueryDto } from './dto/get-testimonies-query.dto';

// Constantes de roles para verificación
const ROLE_ADMIN = 'ADMIN';
const ROLE_SUPERADMIN = 'SUPERADMIN';

@Injectable()
export class TestimoniesService {
  private readonly logger = new Logger(TestimoniesService.name);

  constructor(
    private readonly testimonyRepository: TestimonyRepository,
    private readonly usersService: UsersService, // Para verificar que el usuario existe y para obtener su rol
    private dataSource: DataSource, // Para transacciones
  ) {}

  /**
   * Crea un nuevo testimonio.
   * @param createTestimonyDto Datos para crear el testimonio.
   * @param userId ID del usuario autenticado que crea el testimonio.
   * @returns El TestimonioDto creado.
   * @throws NotFoundException si el usuario no existe.
   * @throws BadRequestException si el usuario ya ha enviado un testimonio y no puede enviar otro.
   */
  async create(
    createTestimonyDto: CreateTestimonyDto,
    userId: string,
  ): Promise<TestimonyDto> {
    this.logger.debug(
      `create(): Intentando crear testimonio para usuario ID: ${userId}`,
    );

    // Verificar si el usuario existe
    const user = await this.usersService.findUserEntityById(userId); // Usar el método que devuelve la entidad User
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    // Opcional: Impedir que un usuario envíe múltiples testimonios (si es tu lógica de negocio)
    // Puedes buscar si ya existe un testimonio activo para este usuario
    const existingTestimonies = await this.testimonyRepository.findAllPaginated(
      { userId: userId, isApproved: false, includeDeleted: false }, // Añadir userId al DTO de consulta
    );
    if (existingTestimonies.total > 0) {
      throw new BadRequestException(
        'Ya has enviado un testimonio. No puedes enviar más de uno.',
      );
    }

    const newTestimony = this.testimonyRepository.createTestimony({
      ...createTestimonyDto,
      user_id: userId,
      user: user, // Asigna la entidad de usuario
      is_approved: false, // Por defecto, el testimonio requiere aprobación
    });

    const savedTestimony = await this.testimonyRepository.saveTestimony(
      newTestimony,
    );
    this.logger.log(
      `create(): Testimonio ID: ${savedTestimony.id} creado por usuario ID: ${userId}. Pendiente de aprobación.`,
    );
    return plainToInstance(TestimonyDto, savedTestimony);
  }

  /**
   * Obtiene todos los testimonios paginados y filtrados.
   * @param queryDto DTO con parámetros de paginación, filtro y ordenación.
   * @param currentUserId ID del usuario autenticado (para verificar permisos).
   * @param currentUserRole Rol del usuario autenticado.
   * @returns Un objeto con la lista de TestimonioDto y el total.
   */
  async findAll(
    queryDto: GetTestimoniesQueryDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<{ testimonies: TestimonyDto[]; total: number }> {
    this.logger.debug(
      `findAll(): Buscando testimonios con filtros: ${JSON.stringify(
        queryDto,
      )}`,
    );

    const isSuperAdminOrAdmin =
      currentUserRole === ROLE_ADMIN || currentUserRole === ROLE_SUPERADMIN;

    // Lógica para determinar si se deben incluir testimonios eliminados (soft-deleted)
    // Solo admins/superadmins pueden verlos si lo solicitan.
    const finalIncludeDeleted = isSuperAdminOrAdmin
      ? queryDto.includeDeleted
      : false;
    queryDto.includeDeleted = finalIncludeDeleted;

    // Por defecto, los usuarios normales solo ven testimonios aprobados
    if (!isSuperAdminOrAdmin && queryDto.isApproved === undefined) {
      queryDto.isApproved = true;
    }

    const { testimonies, total } =
      await this.testimonyRepository.findAllPaginated(queryDto);

    const testimoniesDto = plainToInstance(TestimonyDto, testimonies);
    this.logger.log(`findAll(): Se encontraron ${total} testimonios.`);
    return { testimonies: testimoniesDto, total };
  }

  /**
   * Obtiene un testimonio por su ID.
   * @param id El ID del testimonio.
   * @param currentUserId ID del usuario autenticado (para verificar propiedad).
   * @param currentUserRole Rol del usuario autenticado.
   * @returns El TestimonioDto encontrado.
   * @throws NotFoundException si el testimonio no se encuentra.
   * @throws ForbiddenException si el usuario no tiene permisos para ver el testimonio.
   */
  async findOne(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<TestimonyDto> {
    this.logger.debug(
      `findOne(): Buscando testimonio con ID: ${id} para usuario ID: ${currentUserId}`,
    );

    const isSuperAdminOrAdmin =
      currentUserRole === ROLE_ADMIN || currentUserRole === ROLE_SUPERADMIN;
    const testimony = await this.testimonyRepository.findOneById(
      id,
      isSuperAdminOrAdmin,
    ); // Admin puede ver soft-deleted

    if (!testimony) {
      throw new NotFoundException(`Testimonio con ID "${id}" no encontrado.`);
    }

    // Si no es admin/superadmin, el testimonio debe estar aprobado o ser del propio usuario
    if (
      !isSuperAdminOrAdmin &&
      !testimony.is_approved &&
      testimony.user_id !== currentUserId
    ) {
      throw new ForbiddenException(
        'No tienes permisos para ver este testimonio.',
      );
    }

    this.logger.log(`findOne(): Testimonio ID: ${id} encontrado.`);
    return plainToInstance(TestimonyDto, testimony);
  }

  /**
   * Actualiza un testimonio por su ID.
   * @param id El ID del testimonio a actualizar.
   * @param updateTestimonyDto Datos para actualizar el testimonio.
   * @param currentUserId ID del usuario que realiza la operación.
   * @param currentUserRole Rol del usuario que realiza la operación.
   * @returns El TestimonioDto actualizado.
   * @throws NotFoundException si el testimonio no se encuentra.
   * @throws ForbiddenException si el usuario no tiene permisos para actualizar el testimonio.
   */
  async update(
    id: string,
    updateTestimonyDto: UpdateTestimonyDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<TestimonyDto> {
    this.logger.debug(
      `update(): Actualizando testimonio ID: ${id} por usuario ID: ${currentUserId}`,
    );

    const isSuperAdminOrAdmin =
      currentUserRole === ROLE_ADMIN || currentUserRole === ROLE_SUPERADMIN;
    const testimonyToUpdate = await this.testimonyRepository.findOneById(
      id,
      true,
    ); // Admin puede ver soft-deleted

    if (!testimonyToUpdate) {
      throw new NotFoundException(`Testimonio con ID "${id}" no encontrado.`);
    }

    // Solo el autor del testimonio o un ADMIN/SUPERADMIN pueden actualizarlo
    if (testimonyToUpdate.user_id !== currentUserId && !isSuperAdminOrAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este testimonio.',
      );
    }

    // Si el usuario intenta cambiar 'is_approved' y no es admin, lanza error
    if (updateTestimonyDto.is_approved !== undefined && !isSuperAdminOrAdmin) {
      throw new ForbiddenException(
        'Solo un administrador puede cambiar el estado de aprobación del testimonio.',
      );
    }

    // Aplicar los cambios
    Object.assign(testimonyToUpdate, updateTestimonyDto);

    const updatedTestimony = await this.testimonyRepository.saveTestimony(
      testimonyToUpdate,
    );
    this.logger.log(`update(): Testimonio ID: ${id} actualizado exitosamente.`);
    return plainToInstance(TestimonyDto, updatedTestimony);
  }

  /**
   * Aprueba un testimonio (solo para administradores).
   * @param id El ID del testimonio a aprobar.
   * @returns El TestimonioDto aprobado.
   * @throws NotFoundException si el testimonio no se encuentra.
   * @throws BadRequestException si el testimonio ya está aprobado.
   */
  async approveTestimony(id: string): Promise<TestimonyDto> {
    this.logger.debug(`approveTestimony(): Aprobando testimonio ID: ${id}`);

    const testimonyToApprove = await this.testimonyRepository.findOneById(id);

    if (!testimonyToApprove) {
      throw new NotFoundException(`Testimonio con ID "${id}" no encontrado.`);
    }
    if (testimonyToApprove.is_approved) {
      throw new BadRequestException(
        `El testimonio con ID "${id}" ya está aprobado.`,
      );
    }

    testimonyToApprove.is_approved = true;
    const approvedTestimony = await this.testimonyRepository.saveTestimony(
      testimonyToApprove,
    );
    this.logger.log(
      `approveTestimony(): Testimonio ID: ${id} aprobado exitosamente.`,
    );
    return plainToInstance(TestimonyDto, approvedTestimony); // <-- Corregido aquí
  }

  /**
   * Realiza un "soft delete" en un testimonio.
   * Solo el autor o un ADMIN/SUPERADMIN puede eliminar lógicamente.
   * @param id El ID del testimonio a desactivar.
   * @param currentUserId ID del usuario que realiza la operación.
   * @param currentUserRole Rol del usuario que realiza la operación.
   * @throws NotFoundException si el testimonio no se encuentra.
   * @throws ForbiddenException si el usuario no tiene permisos.
   * @throws BadRequestException si el testimonio ya está eliminado.
   */
  async softDelete(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<void> {
    this.logger.debug(
      `softDelete(): Soft-eliminando testimonio ID: ${id} por usuario ID: ${currentUserId}`,
    );

    const isSuperAdminOrAdmin =
      currentUserRole === ROLE_ADMIN || currentUserRole === ROLE_SUPERADMIN;
    const testimonyToDelete = await this.testimonyRepository.findOneById(
      id,
      false,
    ); // No incluir soft-deleted para esta comprobación

    if (!testimonyToDelete) {
      throw new NotFoundException(`Testimonio con ID "${id}" no encontrado.`);
    }
    if (testimonyToDelete.deleted_at !== null) {
      throw new BadRequestException(
        `El testimonio con ID "${id}" ya está eliminado.`,
      );
    }

    // Solo el autor o un ADMIN/SUPERADMIN pueden eliminar
    if (testimonyToDelete.user_id !== currentUserId && !isSuperAdminOrAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este testimonio.',
      );
    }

    await this.testimonyRepository.softDeleteTestimony(id);
    this.logger.log(
      `softDelete(): Testimonio ID: ${id} soft-eliminado exitosamente.`,
    );
  }

  /**
   * Elimina permanentemente un testimonio de la base de datos (hard delete).
   * Solo SUPERADMIN puede realizar esta operación.
   * @param id El ID del testimonio a eliminar.
   * @throws NotFoundException si el testimonio no se encuentra.
   * @throws ForbiddenException si el usuario no es SUPERADMIN.
   */
  async hardDelete(id: string): Promise<void> {
    this.logger.warn(
      `hardDelete(): Intentando eliminar permanentemente el testimonio ID: ${id}`,
    );

    const testimony = await this.testimonyRepository.findOneById(id, true); // Incluir soft-deleted para hard delete
    if (!testimony) {
      throw new NotFoundException(`Testimonio con ID "${id}" no encontrado.`);
    }

    await this.testimonyRepository.hardDeleteTestimony(id);
    this.logger.log(
      `hardDelete(): Testimonio ID: ${id} eliminado permanentemente.`,
    );
  }
}
