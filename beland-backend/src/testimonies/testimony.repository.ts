// src/testimonies/testimony.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  FindOptionsWhere,
  LessThanOrEqual,
  IsNull,
  Not,
} from 'typeorm';
import { Testimony } from './entities/testimony.entity';
import { GetTestimoniesQueryDto } from './dto/get-testimonies-query.dto'; // Usa este DTO

@Injectable()
export class TestimonyRepository extends Repository<Testimony> {
  private readonly logger = new Logger(TestimonyRepository.name);

  constructor(
    @InjectRepository(Testimony)
    private readonly testimonyORMRepository: Repository<Testimony>,
    private dataSource: DataSource,
  ) {
    super(Testimony, dataSource.createEntityManager());
  }

  /**
   * Helper para crear un query builder con cargas ansiosas comunes para Testimony y sus relaciones.
   * Esto asegura que cuando se busca un testimonio, el usuario que lo escribió también se cargue.
   * @param alias El alias para la entidad Testimony en la consulta.
   * @param includeDeleted Si se deben incluir los testimonios marcados como eliminados (soft-deleted).
   * @returns Una instancia de TypeORM QueryBuilder.
   */
  private createQueryBuilderWithRelations(
    alias = 'testimony',
    includeDeleted: boolean = false,
  ) {
    const queryBuilder = this.testimonyORMRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user`, 'user') // Carga eager del usuario que escribió el testimonio
      .leftJoinAndSelect('user.role_relation', 'userRole'); // Carga el rol del usuario

    if (!includeDeleted) {
      queryBuilder.andWhere(`${alias}.deleted_at IS NULL`);
    }

    return queryBuilder;
  }

  /**
   * Busca un testimonio por su ID.
   * @param id El ID del testimonio.
   * @param includeDeleted Si se deben incluir testimonios marcados como eliminados.
   * @returns La entidad Testimony o null si no se encuentra.
   */
  async findOneById(
    id: string,
    includeDeleted: boolean = false,
  ): Promise<Testimony | null> {
    this.logger.debug(`findOneById(): Buscando testimonio con ID: ${id}`);
    return this.createQueryBuilderWithRelations('testimony', includeDeleted)
      .where('testimony.id = :id', { id })
      .getOne();
  }

  /**
   * Busca todos los testimonios paginados, filtrados y ordenados.
   * @param queryDto DTO con parámetros de paginación, filtro y ordenación.
   * @returns Una promesa que resuelve a un objeto con la lista de testimonios y el total.
   */
  async findAllPaginated(
    queryDto: GetTestimoniesQueryDto,
  ): Promise<{ testimonies: Testimony[]; total: number }> {
    this.logger.debug(
      `findAllPaginated(): Buscando testimonios con filtros: ${JSON.stringify(
        queryDto,
      )}`,
    );

    // Acceder directamente a las propiedades del queryDto
    const limit = queryDto.limit !== undefined ? queryDto.limit : 10;
    const offset = queryDto.offset !== undefined ? queryDto.offset : 0;
    const isApproved = queryDto.isApproved;
    const includeDeleted =
      queryDto.includeDeleted !== undefined ? queryDto.includeDeleted : false;
    const orderBy =
      queryDto.orderBy !== undefined ? queryDto.orderBy : 'created_at';
    const order = queryDto.order !== undefined ? queryDto.order : 'DESC';
    const userId = queryDto.userId;

    const queryBuilder = this.createQueryBuilderWithRelations(
      'testimony',
      includeDeleted,
    );

    // Filtrar por ID de usuario si se proporciona
    if (userId) {
      queryBuilder.andWhere('testimony.user_id = :userId', { userId });
    }

    // Filtrar por estado de aprobación si se proporciona
    if (typeof isApproved === 'boolean') {
      queryBuilder.andWhere('testimony.is_approved = :isApproved', {
        isApproved,
      });
    }

    // Ordenación
    if (orderBy && order) {
      // Manejar ordenación por relaciones si es necesario
      if (orderBy.startsWith('user.')) {
        queryBuilder.orderBy(orderBy, order);
      } else {
        queryBuilder.orderBy(`testimony.${orderBy}`, order);
      }
    }

    // Paginación
    queryBuilder.skip(offset).take(limit);

    const [testimonies, total] = await queryBuilder.getManyAndCount();

    this.logger.debug(
      `findAllPaginated(): Se encontraron ${total} testimonios.`,
    );
    return { testimonies, total };
  }

  /**
   * Guarda una entidad Testimony en la base de datos.
   * @param testimony La entidad Testimony a guardar.
   * @returns La entidad Testimony guardada.
   */
  async saveTestimony(testimony: Testimony): Promise<Testimony> {
    this.logger.log(
      `saveTestimony(): Guardando testimonio con ID: ${
        testimony.id || 'nuevo'
      }`,
    );
    return this.testimonyORMRepository.save(testimony);
  }

  /**
   * Crea una nueva instancia de Testimony.
   * @param testimonyPartial Datos parciales de la entidad Testimony.
   * @returns La nueva entidad Testimony (no guardada aún).\
   */
  createTestimony(testimonyPartial: Partial<Testimony>): Testimony {
    return this.testimonyORMRepository.create(testimonyPartial);
  }

  /**
   * Realiza un "soft delete" en un testimonio, marcándolo como eliminado lógicamente.
   * Esto establece la columna `deleted_at` a la fecha y hora actuales.
   * @param id El ID del testimonio a desactivar.
   */
  async softDeleteTestimony(id: string): Promise<void> {
    this.logger.log(`softDeleteTestimony(): Testimonio ${id} soft-deleted.`);
    await this.testimonyORMRepository.update(
      { id },
      { deleted_at: new Date() },
    );
  }

  /**
   * Elimina un testimonio por su ID (borrado físico).
   * NOTA: Esto realiza un borrado físico. Úsalo con precaución.
   * @param id El ID del testimonio a eliminar.
   */
  async hardDeleteTestimony(id: string): Promise<void> {
    this.logger.warn(
      `hardDeleteTestimony(): Eliminando físicamente el testimonio ${id}.`,
    );
    await this.testimonyORMRepository.delete(id);
  }
}
