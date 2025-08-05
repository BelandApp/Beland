import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './products.repository';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly repo: ProductRepository) {}

  async create(dto: CreateProductDto) {
    const exists = await this.repo.findByName(dto.name);
    if (exists) {
      throw new ConflictException(`El producto "${dto.name}" ya existe.`);
    }

    const newProduct = this.repo.create(dto);
    return await this.repo.save(newProduct);
  }

  async findAll(pagination: PaginationDto, order: OrderDto, category?: string) {
    return this.repo.findAllPaginated(pagination, order, category);
  }

  async findOne(id: string) {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  // src/products/products.service.ts
  async remove(id: string) {
    const product = await this.findOne(id);
    await this.repo.softRemove(product);
  }
}
