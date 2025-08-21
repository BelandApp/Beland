import { Injectable, OnModuleInit } from '@nestjs/common'; 
import { WalletsRepository } from 'src/wallets/wallets.repository';

@Injectable()
export class SuperadminConfigService implements OnModuleInit {
  private superadminWalletId: string;
  private readonly priceOneBecoin = 0.05;

  constructor(private readonly walletRepository: WalletsRepository) {}

  async onModuleInit() {
    // Podés cambiar el criterio de búsqueda si lo manejás con un flag en la DB
    const superadminWallet = await this.walletRepository.findSuperadminWallet();
    if (!superadminWallet) {
      throw new Error('No se encontró la wallet del superadmin');
    }
    this.superadminWalletId = superadminWallet.id;
  }

  getWalletId(): string {
    return this.superadminWalletId;
  }

  getPriceOneBecoin(): number {
    return this.priceOneBecoin;
  }
}

