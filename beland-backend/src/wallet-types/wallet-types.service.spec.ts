import { Test, TestingModule } from '@nestjs/testing';
import { WalletTypesService } from './wallet-types.service';

describe('WalletTypesService', () => {
  let service: WalletTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletTypesService],
    }).compile();

    service = module.get<WalletTypesService>(WalletTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
