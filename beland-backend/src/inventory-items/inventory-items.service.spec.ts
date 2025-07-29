import { Test, TestingModule } from '@nestjs/testing';
import { InventoryItemsService } from './inventory-items.service';

describe('InventoryItemsService', () => {
  let service: InventoryItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryItemsService],
    }).compile();

    service = module.get<InventoryItemsService>(InventoryItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
