import { Module } from '@nestjs/common';
import { WalletTypesService } from './wallet-types.service';
import { WalletTypesController } from './wallet-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletType } from './entities/wallet-type.entity';
import { WalletTypesRepository } from './wallet-types.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WalletType])],
  controllers: [WalletTypesController],
  providers: [WalletTypesService, WalletTypesRepository],
})
export class WalletTypesModule {}
