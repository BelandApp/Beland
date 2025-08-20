import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DefaultRolesSeeder } from './seeders/default-roles.seeder';
import { SuperAdminUserSeeder } from './seeders/superadmin-user.seeder';

// JSON
import preloadTT from './json/transactionsType.json';
import preloadTS from './json/transactionState.json';
import preloadProduct from './json/products.json';
import preloadPaymentType from './json/paymentType.json';
import preloadGroupType from './json/groupType.json';
import preloadResourceType from './json/resourceType.json';

// Entidades
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { Product } from 'src/products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentType } from 'src/payment-types/entities/payment-type.entity';
import { Category } from 'src/category/entities/category.entity';
import { GroupType } from 'src/group-type/entities/group-type.entity';
import { ResourcesType } from 'src/resources-types/entities/resources-type.entity';

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
    @InjectRepository(PaymentType)
    private readonly payTypeRepo: Repository<PaymentType>,
    @InjectRepository(Category)
    private readonly CatRepo: Repository<Category>,
    @InjectRepository(GroupType)
    private readonly groupTypeRepo: Repository<GroupType>,
    @InjectRepository(ResourcesType)
    private readonly resourceTypeRepo: Repository<ResourcesType>,
  ) {}

  async preload<T>(
    dataArray: Partial<T>[],
    repository: Repository<T>,
    compareKey: keyof T,
    logLabel: string,
  ): Promise<void> {
    try {
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
    } catch (error) {
      console.error(`Error al cargar ${logLabel}: ${JSON.stringify(error)}`)
    }
  }

  async preloadProd<T>(): Promise<void> {
    try {
    let count = 0;
    let countCat = 0;

    for (const product of preloadProduct) {
      const prod = await this.productRepo.findOneBy({name: product.name})
      if (!prod) {
        let cat = await this.CatRepo.findOneBy({name: product.category})
        if (!cat) {
          cat = await this.CatRepo.save({name:product.category});
          countCat++;
        }
        const {category, ...saveProduct} = product;
        await this.productRepo.save({...saveProduct, category_id: cat.id});
        count++;
      }
    }

    console.log(`Se agregaron ${countCat} Categorias`);
    console.log(`Se agregaron ${count} Productos`);
    } catch (error) {
      console.error(`Error al cargar Productos: ${JSON.stringify(error)}`)
    }
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
      await this.preloadProd();
      await this.preload<PaymentType>(preloadPaymentType, this.payTypeRepo, 'code', 'Formas de Pago');
      await this.preload<GroupType>(preloadGroupType, this.groupTypeRepo, 'name', 'Tipos de Grupos');
      await this.preload<ResourcesType>(preloadResourceType, this.resourceTypeRepo, 'code', 'Tipos de Recursos');
    } catch (error: any) {

      this.logger.error(
        `❌ Error durante la inicialización de la aplicación: ${error.message}`,
        error.stack,
      ); 
    }
  }
}
