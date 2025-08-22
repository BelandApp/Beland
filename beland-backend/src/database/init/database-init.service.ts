import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

// Seeders
import { DefaultRolesSeeder } from './seeders/default-roles.seeder';
import { SuperAdminUserSeeder } from './seeders/superadmin-user.seeder';

// JSON
import preloadTT from './json/transactionsType.json';
import preloadTS from './json/transactionState.json';
import preloadProduct from './json/products.json';
import preloadPaymentType from './json/paymentType.json';
import preloadGroupType from './json/groupType.json';
import preloadResourceType from './json/resourceType.json';
import preloadWithdrawAccountType from './json/withdrawAccountType.json';
import preloadWalletType from './json/walletType.json';

// Entidades
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaymentType } from 'src/payment-types/entities/payment-type.entity';
import { Category } from 'src/category/entities/category.entity';
import { GroupType } from 'src/group-type/entities/group-type.entity';
import { ResourcesType } from 'src/resources-types/entities/resources-type.entity';
import { WithdrawAccountType } from 'src/withdraw-account-type/entities/withdraw-account-type.entity';
import { WalletType } from 'src/wallet-types/entities/wallet-type.entity';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly defaultRolesSeeder: DefaultRolesSeeder,
    private readonly superAdminUserSeeder: SuperAdminUserSeeder,
  ) {}

  private getRepo<T>(entity: any): Repository<T> {
    return this.dataSource.getRepository(entity);
  }

  private async preload<T>(
    dataArray: Partial<T>[],
    entity: any,
    compareKey: keyof T,
    logLabel: string,
  ): Promise<void> {
    try {
      const repository = this.getRepo<T>(entity);
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
      console.error(
        `Error al cargar ${logLabel}: ${JSON.stringify(error)}`,
      );
    }
  }

  private async preloadProd(): Promise<void> {
    try {
      const productRepo = this.getRepo<Product>(Product);
      const catRepo = this.getRepo<Category>(Category);

      let count = 0;
      let countCat = 0;

      for (const product of preloadProduct) {
        const prod = await productRepo.findOneBy({ name: product.name });
        if (!prod) {
          let cat = await catRepo.findOneBy({ name: product.category });
          if (!cat) {
            cat = await catRepo.save({ name: product.category });
            countCat++;
          }
          const { category, ...saveProduct } = product;
          await productRepo.save({ ...saveProduct, category_id: cat.id });
          count++;
        }
      }

      console.log(`Se agregaron ${countCat} Categorias`);
      console.log(`Se agregaron ${count} Productos`);
    } catch (error) {
      console.error(
        `Error al cargar Productos: ${JSON.stringify(error)}`,
      );
    }
  }

  async onModuleInit() {
    this.logger.log('🚀 Iniciando procesos de inicialización...');

    try {

      await this.preload<TransactionType>(
        preloadTT,
        TransactionType,
        'code',
        'Tipos de Transacciones',
      );
      await this.preload<TransactionState>(
        preloadTS,
        TransactionState,
        'code',
        'Estados de Transacciones',
      );
      await this.preloadProd();
      await this.preload<PaymentType>(
        preloadPaymentType,
        PaymentType,
        'code',
        'Formas de Pago',
      );
      await this.preload<GroupType>(
        preloadGroupType,
        GroupType,
        'name',
        'Tipos de Grupos',
      );
      await this.preload<ResourcesType>(
        preloadResourceType,
        ResourcesType,
        'code',
        'Tipos de Recursos',
      );
      await this.preload<WithdrawAccountType>(
        preloadWithdrawAccountType,
        WithdrawAccountType,
        'code',
        'Tipos de Cuentas para Retiros',
      );
      await this.preload<WalletType>(
        preloadWalletType,
        WalletType,
        'code',
        'Tipos de Wallets',
      );

      await this.defaultRolesSeeder.seed();
      await this.superAdminUserSeeder.seed();

      this.logger.log('✅ Inicialización completada exitosamente.');
    } catch (error: any) {
      this.logger.error(
        `❌ Error durante la inicialización: ${error.message}`,
        error.stack,
      );
    }
  }
}
