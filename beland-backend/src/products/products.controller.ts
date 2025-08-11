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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductQueryDto } from './dto/product-query.dto';
<<<<<<< HEAD
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
=======
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
>>>>>>> dev

@ApiTags('products')
@Controller('products')
@ApiBearerAuth('JWT-auth')
<<<<<<< HEAD
@UseGuards(AuthenticationGuard)
=======
@UseGuards(FlexibleAuthGuard)
>>>>>>> dev
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
  @ApiOperation({
    summary: 'Listar productos con paginación, ordenamiento y filtrado',
  })
  async findAll(@Query() query: ProductQueryDto) {
    const { page, limit, sortBy, order, category, name } = query;
    return this.productsService.findAll(
      { page, limit },
      { sortBy, order },
      category,
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
