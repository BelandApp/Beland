import { Module } from '@nestjs/common';
import { DatabaseInitService } from './database-init.service';
import { DefaultRolesSeeder } from './seeders/default-roles.seeder';
import { SuperAdminUserSeeder } from './seeders/superadmin-user.seeder';
import { RolesModule } from '../../roles/roles.module'; // Ruta relativa ajustada
import { UsersModule } from '../../users/users.module'; // Ruta relativa ajustada
import { ConfigModule } from '@nestjs/config'; // Necesario para ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionState } from 'src/transaction-state/entities/transaction-state.entity';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaymentType } from 'src/payment-types/entities/payment-type.entity';
import { Category } from 'src/category/entities/category.entity';
import { GroupType } from 'src/group-type/entities/group-type.entity';
import { ResourcesType } from 'src/resources-types/entities/resources-type.entity';

@Module({
  imports: [
    RolesModule,
    UsersModule,
    ConfigModule, // Asegúrate de que ConfigModule esté importado aquí o globalmente
    TypeOrmModule.forFeature([TransactionState, TransactionType, Product, PaymentType, Category, GroupType,
      ResourcesType
    ])
  ],
  providers: [
    DatabaseInitService,
    DefaultRolesSeeder,
    SuperAdminUserSeeder,
    // Aquí puedes añadir otros servicios de inicialización general si los tuvieras
  ],
  exports: [DatabaseInitService],
})
export class DatabaseInitModule {}
