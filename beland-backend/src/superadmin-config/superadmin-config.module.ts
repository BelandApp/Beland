import { Global, Module } from '@nestjs/common';
import { SuperadminConfigService } from './superadmin-config.service';
import { WalletsRepository } from 'src/wallets/wallets.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';

@Global() // <- Esto lo hace accesible en toda la app sin importar el módulo
@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  providers: [SuperadminConfigService, WalletsRepository],
  exports: [SuperadminConfigService],
})
export class SuperadminModule {}
