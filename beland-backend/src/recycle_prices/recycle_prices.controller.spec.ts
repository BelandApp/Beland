import { Test, TestingModule } from '@nestjs/testing';
import { RecyclePricesController } from './recycle_prices.controller';
import { RecyclePricesService } from './recycle_prices.service';

describe('RecyclePricesController', () => {
  let controller: RecyclePricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecyclePricesController],
      providers: [RecyclePricesService],
    }).compile();

    controller = module.get<RecyclePricesController>(RecyclePricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
