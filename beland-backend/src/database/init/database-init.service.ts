import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DefaultRolesSeeder } from './seeders/default-roles.seeder';
import { SuperAdminUserSeeder } from './seeders/superadmin-user.seeder';

// JSON
import preloadTT from './json/transactionsType.json';
import preloadTS from './json/transactionState.json';
import preloadProduct from './json/products.json';

// Entidades
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { Product } from 'src/products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    private readonly defaultRolesSeeder: DefaultRolesSeeder,
    private readonly superAdminUserSeeder: SuperAdminUserSeeder,
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
    this.logger.log(
      '🚀 Iniciando todos los procesos de inicialización de la aplicación...',
    );
    
    try {
      await this.defaultRolesSeeder.seed();
      await this.superAdminUserSeeder.seed();
      this.logger.log(
        '✅ Todos los procesos de inicialización completados exitosamente.',
      );
      await this.preload<TransactionType>(preloadTT, this.transTypeRepo, 'code', 'Tipos de Transacciones');
      await this.preload<TransactionState>(preloadTS, this.transStateRepo, 'code', 'Estados de Transacciones');
      await this.preload<Product>(preloadProduct, this.productRepo, 'name', 'Productos');
    } catch (error: any) {
      this.logger.error(
        `❌ Error durante la inicialización de la aplicación: ${error.message}`,
        error.stack,
      );
    }
  }
}
