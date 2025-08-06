import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';

@Injectable()
export class ProductRepository extends Repository<Product> {
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
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = pagination;
    const { sortBy = 'created_at', order: orderDir = 'DESC' } = order;

    const query = this.createQueryBuilder('product');

    if (category) {
      query.andWhere('LOWER(product.category) = LOWER(:category)', {
        category,
      });
    }

    query.orderBy(`product.${sortBy}`, orderDir);
    query.skip((page - 1) * limit).take(limit);

    const [products, total] = await query.getManyAndCount();

    return { products, total, page, limit };
  }
}
