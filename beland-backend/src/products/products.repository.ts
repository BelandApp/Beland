import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { GroupType } from 'src/group-type/entities/group-type.entity';

@Injectable()
export class ProductRepository extends Repository<Product> {
  private readonly logger = new Logger(ProductRepository.name);
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Product | null> {
    return this.findOne({ 
      where: { id },
      relations: {category: true}
    });
  }

  async findByName(name: string): Promise<Product | null> {
    return this.findOne({ 
      where: { name },
      relations: {category: true}
    });
  }

async findAllPaginated(
  pagination: PaginationDto,
  order: OrderDto,
  category_id?: string,
  name?: string,
): Promise<{
  products: Product[];
  total: number;
  page: number;
  limit: number;
}> {
  const { page = 1, limit = 10 } = pagination;
  const { sortBy = 'created_at', order: orderDir = 'DESC' } = order;

  this.logger.log(
    `[ProductRepository] Parámetros recibidos: ${JSON.stringify({ pagination, order, category_id, name })}`,
  );

  // Base query
  const query = this.createQueryBuilder('product');

  // Filtro por categoría (si viene ID)
  if (category_id) {
    this.logger.log(`[ProductRepository] Filtrando por categoría ID: ${category_id}`);
    query
      .innerJoin('product.category', 'category') // JOIN solo si filtro
      .andWhere('category.id = :categoryId', {
        categoryId: category_id,
      })
      .addSelect(['category.id', 'category.name']); // Solo traigo lo necesario de category
  }

  // Filtro por nombre
  if (name) {
    this.logger.log(`[ProductRepository] Filtrando por nombre: ${name}`);
    query.andWhere('product.name ILIKE :name', {
      name: `%${name}%`,
    });
  }

  // Validar y setear columna de orden
  const validSortColumns = ['created_at', 'name', 'price', 'cost'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';

  // Orden + paginación
  query.orderBy(`product.${sortColumn}`, orderDir.toUpperCase() as 'ASC' | 'DESC');
  query.skip((page - 1) * limit).take(limit);

  // Debug query
  this.logger.log(`[ProductRepository] Query SQL: ${query.getSql()}`);

  // Ejecución
  const [products, total] = await query.getManyAndCount();

  this.logger.log(
    `[ProductRepository] Resultados: total=${total}, productos=${products.length}`,
  );

  return { products, total, page, limit };
}

async addGroupTypesToProduct(productId: string, groupTypeIds: string[]): Promise<Product> {
    const productRepo = this.dataSource.getRepository(Product);
    const groupRepo = this.dataSource.getRepository(GroupType);

    // Buscar producto con la relación
    const product = await productRepo.findOne({
      where: { id: productId },
      relations: ['group_types'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    }

    // Buscar los tipos de grupo
    const groupTypes = await groupRepo.findBy({ id: In(groupTypeIds) });

    if (!groupTypes.length) {
      throw new NotFoundException(`No se encontraron GroupTypes para los IDs especificados`);
    }

    // Agregar evitando duplicados
    const existingIds = new Set(product.group_types.map(gt => gt.id));
    const newGroupTypes = groupTypes.filter(gt => !existingIds.has(gt.id));

    product.group_types = [...product.group_types, ...newGroupTypes];

    return await productRepo.save(product);
  }
}
