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
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AddGroupTypesDto, CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProductQueryDto } from './dto/product-query.dto';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { Product } from './entities/product.entity';

@ApiTags('products')
@Controller('products')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
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

  @Post('group-types/:id')
  @ApiOperation({ summary: 'Asociar tipos de grupo a un producto' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del producto' })
  @ApiBody({
    type: AddGroupTypesDto,
    examples: {
      example1: {
        summary: 'Ejemplo de asociación',
        value: { groupTypeIds: ['uuid-1', 'uuid-2'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Producto actualizado con nuevos tipos de grupo', type: Product })
  async addGroupTypes(
    @Param('id') productId: string,
    @Body() body: AddGroupTypesDto,
  ): Promise<Product> {
    return this.productsService.addGroupTypesToProduct(productId, body.groupTypeIds);
  }


  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar productos con paginación, ordenamiento y filtrado',
  })
  async findAll(@Query() query: ProductQueryDto) {
    const { page, limit, sortBy, order, category_id, name } = query;
    return this.productsService.findAll(
      { page, limit },
      { sortBy, order },
      category_id,
      name
    );
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
