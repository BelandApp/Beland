import { NestFactory } from '@nestjs/core';
import { ProductsService } from '../products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductsService);

  const filePath = path.join(__dirname, '../data/mock-products.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(fileContent) as unknown as CreateProductDto[];

  for (const product of products) {
    try {
      await productService.create(product);
      console.log(`✅ Producto creado: ${product.name}`);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(
          `⚠️  No se pudo crear: ${product.name} - ${error.message}`,
        );
      } else {
        console.warn(
          `⚠️  No se pudo crear: ${product.name} - error desconocido`,
        );
      }
    }
  }

  await app.close();
}
void bootstrap();
