import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';

@Injectable()
export class ProductRepository extends Repository<Product> {
  private readonly logger = new Logger(ProductRepository.name);
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Product | null> {
    return this.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Product | null> {
    return this.createQueryBuilder('product')
      .where('LOWER(product.name) = LOWER(:name)', { name })
      .getOne();
  }

  async findAllPaginated(
    pagination: PaginationDto,
    order: OrderDto,
    category?: string,
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
      `[ProductRepository] Parámetros recibidos: ${JSON.stringify({ pagination, order, category, name })}`,
    );

    const query = this.createQueryBuilder('product');

    if (category) {
      this.logger.log(
        `[ProductRepository] Filtrando por categoría: ${category}`,
      );
      query.andWhere('product.category ILIKE :category', {
        category: `%${category}%`,
      });
    }

    if (name) {
      this.logger.log(`[ProductRepository] Filtrando por nombre: ${name}`);
      query.andWhere('product.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    this.logger.log(`[ProductRepository] Query SQL: ${query.getSql()}`);

    query.orderBy(`product.${sortBy}`, orderDir);
    query.skip((page - 1) * limit).take(limit);

    const [products, total] = await query.getManyAndCount();

    this.logger.log(
      `[ProductRepository] Resultados: total=${total}, productos=${products.length}`,
    );

    return { products, total, page, limit };
  }
}
