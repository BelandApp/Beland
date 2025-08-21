import { Test, TestingModule } from '@nestjs/testing';
import { WalletTypesController } from './wallet-types.controller';
import { WalletTypesService } from './wallet-types.service';

describe('WalletTypesController', () => {
  let controller: WalletTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletTypesController],
      providers: [WalletTypesService],
    }).compile();

    controller = module.get<WalletTypesController>(WalletTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
