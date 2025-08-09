import { Module } from '@nestjs/common';
import { CartsService } from './cart.service';
import { CartsController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartsRepository } from './cart.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Cart])],
  controllers: [CartsController],
  providers: [CartsService, CartsRepository],
})
export class CartModule {}
