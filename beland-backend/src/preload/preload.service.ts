// Importación de preloads
import preloadTT from './preloadFiles/transactionsType.json';
import preloadTS from './preloadFiles/transactionState.json';
import preloadProduct from './preloadFiles/products.json';

// NestJS & TypeORM
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entidades
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class PreloadService implements OnModuleInit {
  constructor(
    @InjectRepository(TransactionType)
    private readonly transTypeRepo: Repository<TransactionType>,
    @InjectRepository(TransactionState)
    private readonly transStateRepo: Repository<TransactionState>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async preload<T>(
    dataArray: Partial<T>[],
    repository: Repository<T>,
    compareKey: keyof T,
    logLabel: string
  ): Promise<void> {
    let count = 0;

    for (const item of dataArray) {
      const where = { [compareKey]: item[compareKey] } as any;
      const existing = await repository.findOne({ where });
      if (!existing) {
        await repository.save(item as T);
        count++;
      }
    }

    console.log(`Se agregaron ${count} ${logLabel}`);
  }

  async onModuleInit() {
    await this.preload<TransactionType>(preloadTT, this.transTypeRepo, 'code', 'Tipos de Transacciones');
    await this.preload<TransactionState>(preloadTS, this.transStateRepo, 'code', 'Estados de Transacciones');
    await this.preload<Product>(preloadProduct, this.productRepo, 'name', 'Productos');
  }
}
