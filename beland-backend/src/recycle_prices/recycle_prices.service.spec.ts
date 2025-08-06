import { Test, TestingModule } from '@nestjs/testing';
import { RecyclePricesService } from './recycle_prices.service';

describe('RecyclePricesService', () => {
  let service: RecyclePricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecyclePricesService],
    }).compile();

    service = module.get<RecyclePricesService>(RecyclePricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
