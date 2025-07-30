import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar productos con paginación y ordenamiento' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() order: OrderDto,
    @Query('category') category?: string,
  ) {
    return this.productsService.findAll(pagination, order, category);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}
